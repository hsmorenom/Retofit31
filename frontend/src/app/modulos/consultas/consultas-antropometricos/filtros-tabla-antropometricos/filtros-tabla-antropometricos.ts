import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../../services/cliente';
import { AntropometricosService } from '../../../../services/antropometricos';
import { InformeService } from '../../../../services/informe';
import { TablasAntropometricos } from "../tablas-antropometricos/tablas-antropometricos";

@Component({
  selector: 'app-filtros-tabla-antropometricos',
  standalone: true,
  imports: [FormsModule, CommonModule, TablasAntropometricos],
  templateUrl: './filtros-tabla-antropometricos.html'
})
export class FiltrosTablaAntropometricos implements OnInit {

  @Output() datosGraficos = new EventEmitter<any>();
  @Output() datosParaInforme = new EventEmitter<any>();
  @Input() graficaBase64: string = '';

  // Filtros
  fechaInicio = '';
  fechaFin = '';
  sexoSeleccionado = '';
  edadMin: number | null = null;
  edadMax: number | null = null;
  metricaSeleccionada = '';
  tipoInformeSeleccionado = '';
  mostrarError = false;

  // Datos
  antropo: any[] = [];
  clientes: any[] = [];
  resultados: any[] = [];

  constructor(
    private antropoService: AntropometricosService,
    private clienteService: ClienteService,
    private informeService: InformeService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.antropoService.consultarInforme().subscribe(res => {
      this.antropo = Array.isArray(res) ? res : [];
    });

    this.clienteService.consultar().subscribe(res => {
      this.clientes = Array.isArray(res) ? res : [];
    });
  }

  // ====================================
  // ▶ CONSULTAR INFORMACIÓN
  // ====================================
  consultarAntropometricos() {

    if (!this.tipoInformeSeleccionado || !this.metricaSeleccionada) {
      alert("Seleccione tipo de informe y métrica");
      this.mostrarError = true;
      return;
    }

    let lista = [...this.antropo];

    // Unir cliente para sexo y edad
    lista = this.unirCliente(lista);

    // Filtro sexo
    if (this.sexoSeleccionado !== '') {
      lista = lista.filter(a => a.SEXO === this.sexoSeleccionado);
    }

    // Filtro edad mínima
    if (this.edadMin !== null) {
      lista = lista.filter(a => a.EDAD >= this.edadMin!);
    }

    // Filtro edad máxima
    if (this.edadMax !== null) {
      lista = lista.filter(a => a.EDAD <= this.edadMax!);
    }

    // Filtro por fechas
    if (this.fechaInicio && this.fechaFin) {
      const ini = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);

      lista = lista.filter(a => {
        const fecha = new Date(a.FECHA_REGISTRO);
        return fecha >= ini && fecha <= fin;
      });
    }

    // Procesar tipo de informe
    this.resultados = this.procesarInforme(lista);

    // Emitir datos para gráficas
    const dataGrafico = this.armarDatosGrafico(this.resultados);
    this.datosGraficos.emit({
      tipoInforme: this.tipoInformeSeleccionado,
      metrica: this.metricaSeleccionada,
      datos: this.resultados,

      // 🔥 NUEVO: datos para radar si aplica
      radar: this.tipoInformeSeleccionado === 'listado_detallado'
        ? this.prepararRadar(this.resultados)
        : null
    });


    // Emitir datos al padre (PDF)
    this.datosParaInforme.emit({
      tipoInforme: this.tipoInformeSeleccionado,
      metrica: this.metricaSeleccionada,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      datos: this.resultados
    });
  }

  // ====================================
  // ▶ Unir antropometría + cliente
  // ====================================
  unirCliente(lista: any[]) {
    return lista.map(a => {
      const cli = this.clientes.find(c => c.ID_CLIENTE === a.CLIENTE);

      return {
        ...a,
        IDENTIFICACION: cli?.IDENTIFICACION ?? '',
        SEXO: cli?.SEXO || "N/D",
        EDAD: cli ? this.calcularEdad(cli.FECHA_NACIMIENTO) : "N/D",
        NOMBRES: cli?.NOMBRES ?? '',
        APELLIDOS: cli?.APELLIDOS ?? ''
      };
    });
  }

  // ====================================
  // ▶ PROCESAR INFORMES
  // ====================================
  procesarInforme(lista: any[]) {

    const campo = this.obtenerCampo(this.metricaSeleccionada);

    // PROMEDIO GENERAL
    if (this.tipoInformeSeleccionado === 'promedio_general') {

      const valores = lista.map(a => Number(a[campo])).filter(v => !isNaN(v));
      const promedio = valores.length > 0 ? (valores.reduce((a, b) => a + b, 0) / valores.length) : 0;

      return [
        { ETIQUETA: 'Promedio general', VALOR: promedio.toFixed(2) }
      ];
    }

    // PROMEDIO POR SEXO
    if (this.tipoInformeSeleccionado === 'promedio_por_sexo') {

      const grupos = ['Masculino', 'Femenino', 'Otro'];

      return grupos.map(sexo => {
        const subset = lista.filter(a => a.SEXO === sexo);
        const valores = subset.map(a => Number(a[campo])).filter(v => !isNaN(v));
        const promedio = valores.length > 0 ? (valores.reduce((a, b) => a + b, 0) / valores.length) : 0;

        return {
          ETIQUETA: sexo,
          VALOR: promedio.toFixed(2)
        };
      });
    }

    // LISTADO DETALLADO
    if (this.tipoInformeSeleccionado === 'listado_detallado') {
      return lista.map(a => ({
        ID_CLIENTE: a.CLIENTE,
        IDENTIFICACION: a.IDENTIFICACION,
        NOMBRES: a.NOMBRES,
        APELLIDOS: a.APELLIDOS,
        SEXO: a.SEXO,
        EDAD: a.EDAD,
        FECHA: a.FECHA_REGISTRO,
        VALOR: a[campo]
      }));
    }

    return [];
  }

  // ====================================
  // ▶ Campo según métrica elegida
  // ====================================
  obtenerCampo(metrica: string) {
    switch (metrica) {
      case 'PESO': return 'PESO';
      case 'ALTURA': return 'ALTURA';
      case 'IMC': return 'INDICE_DE_MASA_CORPORAL';
      case 'PGC': return 'PORCENTAJE_GRASA_CORPORAL';
      case 'CUELLO': return 'CIRCUNFERENCIA_CUELLO';
      case 'CINTURA': return 'CIRCUNFERENCIA_CINTURA';
      case 'CADERA': return 'CIRCUNFERENCIA_CADERA';
      default: return '';
    }
  }

  prepararRadar(data: any[]) {
    return {
      labels: data.map(d => `${d.NOMBRES}`),
      values: data.map(d => Number(d.VALOR))
    };
  }


  // ====================================
  // ▶ ARMAR DATOS PARA GRÁFICOS
  // ====================================
  armarDatosGrafico(lista: any[]) {
    if (this.tipoInformeSeleccionado === 'listado_detallado') return [];

    return lista.map(item => ({
      etiqueta: item.ETIQUETA,
      valor: Number(item.VALOR)
    }));
  }

  // ====================================
  // ▶ LIMPIAR
  // ====================================
  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.sexoSeleccionado = '';
    this.edadMin = null;
    this.edadMax = null;
    this.metricaSeleccionada = '';
    this.tipoInformeSeleccionado = '';
    this.resultados = null as any;
    this.datosGraficos.emit(null);
    this.datosParaInforme.emit(null);
    this.mostrarError = false;

  }

  // ====================================
  // ▶ CALCULAR EDAD
  // ====================================
  calcularEdad(fecha: string): number {
    const hoy = new Date();
    const f = new Date(fecha);
    let edad = hoy.getFullYear() - f.getFullYear();
    const m = hoy.getMonth() - f.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) edad--;

    return edad;
  }

  // ====================================
  // ▶ GENERAR INFORME PDF
  // ====================================
  generarInformeAntropometricos() {

    if (!this.resultados.length) {
      alert("Primero realice una consulta.");
      return;
    }

    if (!this.graficaBase64) {
      alert("La gráfica no está generada.");
      return;
    }

    const idUsuario = Number(localStorage.getItem('idUsuario'));

    // 🔄 Mapeo para no mezclar informes administrativos con antropométricos
    let tipoPDF = "";

    switch (this.tipoInformeSeleccionado) {
      case "promedio_general":
        tipoPDF = "antropometrico_promedio_general";
        break;
      case "promedio_por_sexo":
        tipoPDF = "antropometrico_promedio_sexo";
        break;
      case "listado_detallado":
        tipoPDF = "antropometrico_listado";
        break;
      default:
        tipoPDF = this.tipoInformeSeleccionado;
    }

    const data = {
      generarPDF: true,
      tipoInforme: tipoPDF,
      metrica: this.metricaSeleccionada,
      usuario: idUsuario,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      datos: this.resultados,
      grafica: this.graficaBase64,
      entidad: "antropometricos",
      id_referencia: null
    };


    this.informeService.insertar(data).subscribe(res => {
      if (res.resultado === 'OK') {
        window.open(res.urlPDF, '_blank');
      }
    });
  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }

}
