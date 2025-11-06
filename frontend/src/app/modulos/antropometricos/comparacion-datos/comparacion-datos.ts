import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente';
import { AntropometricosService } from '../../../services/antropometricos';
import { Evolucion_dataService } from '../../../services/evolucion-data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comparacion-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparacion-datos.html'
})
export class ComparacionDatos {

  @Output() mostrarEvolucion = new EventEmitter<boolean>();


  documentoBusqueda = '';
  clientesSeleccionados: any[] = [];

  sexoSeleccionado: string | null = null;
  mostrarCadera = false;

  tipoDatoSeleccionado = '';
  fechaInicio = '';
  fechaFin = '';

  mostrarTabla = false;
  datosFiltrados: any[] = [];
  registrosSeleccionados: any[] = [];

  nombreColumnaDato = '';

  constructor(
    private clienteService: ClienteService,
    private antropometricosService: AntropometricosService,
    private evolucionDataService: Evolucion_dataService,
    private router: Router
  ) { }

  buscarCliente() {
    const doc = (this.documentoBusqueda || '').trim();
    if (!doc) return;

    this.clienteService.buscarPorDocumento(doc).subscribe({
      next: (res) => {
        let cliente = Array.isArray(res) ? res[0] : res;
        if (!cliente?.ID_CLIENTE) {
          alert("Cliente no encontrado");
          return;
        }

        this.clientesSeleccionados = [cliente];
        this.sexoSeleccionado = cliente.SEXO;
        this.mostrarCadera = this.sexoSeleccionado !== 'Masculino';
        this.documentoBusqueda = '';
      }
    });
  }

  eliminarCliente(id: number) {
    this.clientesSeleccionados = [];
    this.limpiarFiltros();
  }

  cambioTipoDato() {
    const nombres: any = {
      PESO: "Peso corporal (Kg)",
      IMC: "Índice de masa corporal (IMC)",
      PGC: "Porcentaje de grasa corporal (%)",
      CUELLO: "Circunferencia de cuello (cm)",
      CINTURA: "Circunferencia de cintura (cm)",
      CADERA: "Circunferencia de cadera (cm)"
    };

    this.nombreColumnaDato = nombres[this.tipoDatoSeleccionado] || '';
  }

  consultarHistorial() {
    const idCliente = this.clientesSeleccionados[0]?.ID_CLIENTE;

    if (!idCliente) {
      alert("Debe seleccionar un usuario primero");
      return;
    }

    this.antropometricosService.filtrarIdCliente(idCliente).subscribe({
      next: (res) => {
        console.log("Datos recibidos:", res);

        let datos = Array.isArray(res) ? res : [];

        const fechaInicio = this.fechaInicio ? new Date(this.fechaInicio) : null;
        const fechaFin = this.fechaFin ? new Date(this.fechaFin) : null;

        if (fechaInicio && fechaFin) {
          datos = datos.filter((d: any) => {
            const fecha = new Date(d.FECHA_REGISTRO);
            return (
              fecha.toString() !== "Invalid Date" &&
              fecha >= fechaInicio &&
              fecha <= fechaFin
            );
          });
        }

        this.datosFiltrados = datos;
        this.mostrarTabla = datos.length > 0;
      },
      error: (err) => {
        console.error("Error consultando datos:", err);
        alert("No se pudieron cargar los datos");
      },
    });
  }



  obtenerNombreCompleto(d: any): string {
    return `${d.PRIMER_NOMBRE || ''} ${d.SEGUNDO_NOMBRE || ''}`.trim();
  }

  obtenerApellidosCompletos(d: any): string {
    return `${d.PRIMER_APELLIDO || ''} ${d.SEGUNDO_APELLIDO || ''}`.trim();
  }


  obtenerValorMostrado(d: any) {
    const val = Number(d[this.tipoDatoSeleccionado]);
    if (isNaN(val)) return '---';

    if (this.tipoDatoSeleccionado === 'IMC') {
      return `${val} (${this.clasificarIMC(val)})`;
    }

    if (this.tipoDatoSeleccionado === 'PGC') {
      return `${val} (${this.clasificarPGC(val, this.sexoSeleccionado!)})`;
    }

    return val;
  }

  clasificarIMC(imc: number): string {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  clasificarPGC(pgc: number, sexo: string): string {
    if (sexo === 'Masculino') {
      if (pgc < 6) return "Esencial";
      if (pgc < 14) return "Atleta";
      if (pgc < 18) return "Fitness";
      if (pgc < 25) return "Promedio";
      return "Obesidad";
    } else {
      if (pgc < 14) return "Esencial";
      if (pgc < 21) return "Atleta";
      if (pgc < 25) return "Fitness";
      if (pgc < 32) return "Promedio";
      return "Obesidad";
    }
  }

  seleccionarRegistro(registro: any) {
    if (this.registrosSeleccionados.includes(registro)) {
      this.registrosSeleccionados = this.registrosSeleccionados.filter(r => r !== registro);
    } else {
      this.registrosSeleccionados.push(registro);
    }
  }

  ocultarComparacion() {
    this.mostrarTabla = false;
  }


  verGrafica() {
    if (this.registrosSeleccionados.length < 2) {
      alert("Seleccione mínimo 2 registros para graficar");
      return;
    }

    // Pasas la selección al service
    this.evolucionDataService.datosSeleccionados = this.registrosSeleccionados;
    this.evolucionDataService.tipoDatoSeleccionado = this.tipoDatoSeleccionado;

    // Fuerzas re-montaje del subcomponente
    this.mostrarEvolucion.emit(false);
    setTimeout(() => this.mostrarEvolucion.emit(true), 0);
  }





  exportarDatos() {
    alert("📥 Exportación lista para implementar ✅");
  }

  limpiarFiltros() {
    this.tipoDatoSeleccionado = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.mostrarTabla = false;
    this.datosFiltrados = [];
    this.registrosSeleccionados = [];
    this.nombreColumnaDato = '';
  }
}
