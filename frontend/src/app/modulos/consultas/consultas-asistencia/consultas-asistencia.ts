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

  @ViewChild(GraficosAsistencia) grafico!: GraficosAsistencia;

  generarInforme() {

    const graficaBase64 = this.grafico?.obtenerImagenBase64();

    const payload = {
      generarPDF: true,
      tipoInforme: this.tipoInformeSeleccionado,
      evento: this.eventoSeleccionado,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      datos: this.dataGraficos,
      grafica: graficaBase64,
      usuario: localStorage.getItem('idUsuario')
    };

    this.informeService.insertar(payload).subscribe(res => {
      window.open(res.urlPDF, '_blank');
    });
  }

}



