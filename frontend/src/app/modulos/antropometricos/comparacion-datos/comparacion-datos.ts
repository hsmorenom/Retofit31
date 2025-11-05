import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente';
import { AntropometricosService } from '../../../services/antropometricos';

@Component({
  selector: 'app-comparacion-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparacion-datos.html'
})
export class ComparacionDatos {

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
    private antropometricosService: AntropometricosService
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

    if (!this.clientesSeleccionados.length) return alert("Seleccione un usuario");
    if (!this.tipoDatoSeleccionado) return alert("Seleccione un tipo de dato");

    const ID_CLIENTE = this.clientesSeleccionados[0].ID_CLIENTE;

    this.antropometricosService.filtrarIdCliente(ID_CLIENTE).subscribe({
      next: (res) => {
        let datos = res || [];

        if (this.fechaInicio && this.fechaFin) {
          const inicio = new Date(this.fechaInicio);
          const fin = new Date(this.fechaFin);

          datos = datos.filter((d: any) => {
            const fecha = new Date(d.FECHA_REGISTRO);
            return fecha >= inicio && fecha <= fin;
          });
        }

        this.datosFiltrados = datos.map((d: any) => ({
          ...d,
          NOMBRE_COMPLETO: this.obtenerNombreCompleto(d),
          APELLIDOS_COMPLETO: this.obtenerApellidosCompletos(d),
          valorMostrado: this.obtenerValorMostrado(d)
        }));


        this.mostrarTabla = true;
      }
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

  verGrafica() {
    alert("📈 Aquí haremos la gráfica con Chart.js 😎");
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
