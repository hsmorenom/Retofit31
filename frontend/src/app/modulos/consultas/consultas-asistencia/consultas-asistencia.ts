import { Component } from '@angular/core';
import { FiltrosTablaAsistencia } from "./filtros-tabla-asistencia/filtros-tabla-asistencia";
import { GraficosAsistencia } from "./graficos-asistencia/graficos-asistencia";
import { ViewChild } from '@angular/core';
import { InformeService } from '../../../services/informe';
import { Entidad_informeService } from '../../../services/entidad-informe';

@Component({
  selector: 'app-consultas-asistencia',
  standalone: true,
  imports: [FiltrosTablaAsistencia, GraficosAsistencia],
  templateUrl: './consultas-asistencia.html'
})
export class ConsultasAsistencia {
  dataGraficos: any[] = [];
  graficaBase64: string = '';
  datosParaPDF: any = null;
  asistenciasFiltradas: any[] = [];
  filtrosParaInforme: any = null;
  eventoSeleccionado = '';
  tipoInformeSeleccionado = '';
  fechaInicio = '';
  fechaFin = '';

  constructor(
    private informeService: InformeService,
    private entidadInformeService: Entidad_informeService,
  ) { }

  recibirDatosGrafica(event: any[]) {
    this.dataGraficos = event;
  }

  recibirDatosParaInforme(event: any) {
    this.filtrosParaInforme = event;
  }

  recibirGrafica(base64: string) {
    console.log("Gráfica recibida desde graficos-asistencia");
    this.graficaBase64 = base64;
  }

  @ViewChild(GraficosAsistencia) grafico!: GraficosAsistencia;



}



