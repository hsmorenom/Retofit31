import { Component } from '@angular/core';
import { AsistenciaService } from '../../../services/asistencia';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-historial-asistencia',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './historial-asistencia.html'
})
export class HistorialAsistencia {

  mostrarHistorialUsuario = false
  filtroTexto: string = '';
  asistenciasFiltradas: any[] = [];

  constructor(private asistenciaService: AsistenciaService) { }


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

    // ⚙️ Llamar al servicio principal
    this.asistenciaService.filtrarIdentificacion(idNumero).subscribe({
      next: (res) => {
        // ✅ Filtramos adicionalmente por fecha si el usuario las completó
        let resultados = res;

        if (fechaInicial && fechaFinal) {
          const inicio = new Date(fechaInicial);
          const fin = new Date(fechaFinal);

          resultados = res.filter((a: any) => {
            const fecha = new Date(a.FECHA_ACTIVIDAD);
            return fecha >= inicio && fecha <= fin;
          });
        }

        this.asistenciasFiltradas = resultados;

        if (resultados.length > 0) {
          this.mostrarHistorialUsuario = true;
          alert(`Usuario encontrado. Se muestran ${resultados.length} registros.`);
        } else {
          this.mostrarHistorialUsuario = false;
          alert('No se encontraron registros de asistencia para este usuario o rango de fechas.');
        }
      },
      error: (err) => {
        console.error('Error al buscar asistencia:', err);
        this.mostrarHistorialUsuario = false;
        alert('Ocurrió un error al realizar la búsqueda.');
      }
    });
  }

  limpiarFiltro(): void {
    this.filtroTexto = '';
    this.mostrarHistorialUsuario = false; // Oculta la tabla
    this.asistenciasFiltradas = [];

    // Limpia también los campos de fecha si existen
    const fechaInicial = document.querySelector('#fechaInicial') as HTMLInputElement;
    const fechaFinal = document.querySelector('#fechaFinal') as HTMLInputElement;

    if (fechaInicial) fechaInicial.value = '';
    if (fechaFinal) fechaFinal.value = '';

    alert('Filtros limpiados correctamente.');
  }

  eliminarAsistencia(id: number): void {
    if (confirm('¿Estás seguro de eliminar este registro de asistencia?')) {
      this.asistenciaService.eliminar(id).subscribe({
        next: (res) => {
          alert('Asistencia eliminada correctamente.');
          this.asistenciasFiltradas = this.asistenciasFiltradas.filter(a => a.ID_ASISTENCIA !== id);
        },
        error: (err) => {
          console.error('Error al eliminar asistencia:', err);
          alert('Hubo un error al eliminar la asistencia.');
        }
      });
    }
  }

  exportarPDF(): void {
  if (!this.asistenciasFiltradas || this.asistenciasFiltradas.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const doc = new jsPDF();

  // 🧩 Encabezado del documento
  doc.setFontSize(16);
  doc.text('Historial de Asistencia', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 25);

  // 🧾 Tabla de datos
  const body = this.asistenciasFiltradas.map((a: any) => [
    a.ID_ASISTENCIA,
    a.IDENTIFICACION,
    `${a.NOMBRES}`,
    `${a.APELLIDOS}`,
    a.NOMBRE_EVENTO,
    a.FECHA_ACTIVIDAD,
    a.NOTIFICACION || '—'
  ]);

  autoTable(doc, {
    head: [['ID', 'Identificación', 'Nombres', 'Apellidos', 'Evento', 'Fecha', 'Notificación']],
    body: body,
    startY: 30,
    styles: { fontSize: 9, halign: 'center' },
    headStyles: { fillColor: [0, 77, 0] }, // Verde institucional
  });

  // 💾 Guardar archivo
  doc.save(`Historial_Asistencia_${new Date().getTime()}.pdf`);
}








}
