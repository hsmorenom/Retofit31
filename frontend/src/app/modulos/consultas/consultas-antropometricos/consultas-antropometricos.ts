import { Component } from '@angular/core';
import { FiltrosTablaAntropometricos } from "./filtros-tabla-antropometricos/filtros-tabla-antropometricos";
import { GraficosAntropometricos } from "./graficos-antropometricos/graficos-antropometricos";


@Component({
  selector: 'app-consultas-antropometricos',
  standalone:true,
  imports: [FiltrosTablaAntropometricos, GraficosAntropometricos],
  templateUrl: './consultas-antropometricos.html'
})
export class ConsultasAntropometricos {

}
