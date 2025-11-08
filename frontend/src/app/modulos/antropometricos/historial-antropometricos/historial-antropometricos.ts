import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AntropometricosService } from '../../../services/antropometricos';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClienteService } from '../../../services/cliente';

@Component({
  selector: 'app-historial-antropometricos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './historial-antropometricos.html'
})
export class HistorialAntropometricos {

  mostrarHistorialUsuario = false
  filtroTexto: string = '';
  antropometricosFiltrados: any[] = [];

  constructor(
    private antropometricosService: AntropometricosService,
    private clienteService: ClienteService
  ) { }


  toggleConsulta(): void {
    const identificacion = this.filtroTexto?.trim();
    const fechaInicial = (document.querySelector('#fechaInicial') as HTMLInputElement)?.value;
    const fechaFinal = (document.querySelector('#fechaFinal') as HTMLInputElement)?.value;

    // 🧩 Validación básica
    if (!identificacion) {
      alert('Por favor ingresa una identificación antes de consultar.');
      return;
    }

    const idNumero = Number(identificacion);
    if (isNaN(idNumero)) {
      alert('La identificación debe ser un número válido.');
      return;
    }

    this.clienteService.buscarPorDocumento(identificacion).subscribe({
      next: (res) => {
        const cliente = Array.isArray(res) ? res[0] : res;
        if (!cliente?.ID_CLIENTE) {
          alert('No se encontró el cliente con esa identificación.');
          return;
        }

        const idCliente = cliente.ID_CLIENTE;

        // ✅ Ahora sí llamamos al servicio correcto
        this.antropometricosService.filtrarIdCliente(idCliente).subscribe({
          next: (res) => {
            this.antropometricosFiltrados = res;
            this.mostrarHistorialUsuario = res.length > 0;
            if (!res.length) alert('No se encontraron registros.');
          },
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error('Error consultando cliente:', err)
    });

  }

  limpiarFiltro(): void {
    this.filtroTexto = '';
    this.mostrarHistorialUsuario = false; // Oculta la tabla
    this.antropometricosFiltrados = [];

    // Limpia también los campos de fecha si existen
    const fechaInicial = document.querySelector('#fechaInicial') as HTMLInputElement;
    const fechaFinal = document.querySelector('#fechaFinal') as HTMLInputElement;

    if (fechaInicial) fechaInicial.value = '';
    if (fechaFinal) fechaFinal.value = '';

    alert('Filtros limpiados correctamente.');
  }

  eliminarAntropometrico(id: number): void {
    if (confirm('¿Estás seguro de eliminar este registro de antropométricos?')) {
      this.antropometricosService.eliminar(id).subscribe({
        next: (res) => {
          alert('Registro antropométrico eliminada correctamente.');
          this.antropometricosFiltrados = this.antropometricosFiltrados.filter(a => a.ID_ANTROPOMETRICOS !== id);
        },
        error: (err) => {
          console.error('Error al eliminar datos antropométricos:', err);
          alert('Hubo un error al eliminar el dato antropométrico.');
        }
      });
    }
  }

  editarFila(a: any): void {
    // Si ya está editando, guardamos
    if (a.editando) {
      this.guardarCambios(a);
    } else {
      // Activamos modo edición
      a.editando = true;
    }
  }

  guardarCambios(a: any): void {
    this.antropometricosService.editar(a.ID_ANTROPOMETRICOS, a).subscribe({
      next: (res) => {
        if (res.resultado === 'OK') {
          alert('✅ Registro actualizado correctamente.');
        } else if (res.resultado === 'SIN_CAMBIOS') {
          alert('⚠️ No se realizaron cambios.');
        } else {
          alert('❌ Error en la actualización.');
        }
        a.editando = false;
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('❌ Ocurrió un error al actualizar el registro.');
      }
    });
  }



  exportarPDF(): void {
    if (!this.antropometricosFiltrados || this.antropometricosFiltrados.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const doc = new jsPDF();

    // 🧩 Encabezado del documento
    doc.setFontSize(16);
    doc.text('Historial de datos antropométricos', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 25);

    // 🧾 Tabla de datos
    const body = this.antropometricosFiltrados.map((a: any) => [
      a.ID_ANTROPOMETRICOS,
      a.IDENTIFICACION,
      `${a.NOMBRES}`,
      `${a.APELLIDOS}`,
      a.SEXO,
      a.PESO,
      a.ALTURA,
      a.PGC,
      a.IMC,
      a.CUELLO,
      a.CINTURA,
      a.CADERA,
      a.FECHA_REGISTRO
    ]);

    autoTable(doc, {
      head: [['ID', 'Identificación', 'Nombres', 'Apellidos', 'Sexo', 'Peso', 'Altura', 'PGC', 'IMC', 'Cuello', 'Cintura', 'Cadera', 'Fecha de registro']],
      body: body,
      startY: 30,
      styles: { fontSize: 9, halign: 'center' },
      headStyles: { fillColor: [0, 77, 0] }, // Verde institucional
    });

    // 💾 Guardar archivo
    doc.save(`Historial_Antropometricos_${new Date().getTime()}.pdf`);
  }

}
