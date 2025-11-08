import { Component } from '@angular/core';
import { FiltrosTablaAsistencia } from "./filtros-tabla-asistencia/filtros-tabla-asistencia";
import { GraficosAsistencia } from "./graficos-asistencia/graficos-asistencia";

@Component({
  selector: 'app-consultas-asistencia',
  standalone:true,
  imports: [FiltrosTablaAsistencia, GraficosAsistencia],
  templateUrl: './consultas-asistencia.html'
})
export class ConsultasAsistencia {

}
