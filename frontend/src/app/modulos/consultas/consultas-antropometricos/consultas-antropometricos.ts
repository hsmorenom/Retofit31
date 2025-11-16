import { Component } from '@angular/core';
import { FiltrosTablaAntropometricos } from "./filtros-tabla-antropometricos/filtros-tabla-antropometricos";
import { GraficosAntropometricos } from "./graficos-antropometricos/graficos-antropometricos";


@Component({
  selector: 'app-consultas-antropometricos',
  standalone: true,
  imports: [FiltrosTablaAntropometricos, GraficosAntropometricos],
  templateUrl: './consultas-antropometricos.html'
})
export class ConsultasAntropometricos {

  dataGraficos: any = null;
  graficaBase64: string = '';
  filtrosParaInforme: any = null;

  recibirDatosParaInforme(event: any) {
    this.filtrosParaInforme = event;
  }

  recibirGrafica(base64: string) {
    console.log("Gráfica recibida desde graficos-asistencia");
    this.graficaBase64 = base64;
  }

}
