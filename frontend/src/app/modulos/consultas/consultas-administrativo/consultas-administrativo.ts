import { Component } from '@angular/core';
import { FiltrosTablaAdministrativo } from "./filtros-tabla-administrativo/filtros-tabla-administrativo";
import { GraficosAdministrativo } from "./graficos-administrativo/graficos-administrativo";

@Component({
  selector: 'app-consultas-administrativo',
  standalone: true,
  imports: [FiltrosTablaAdministrativo, GraficosAdministrativo],
  templateUrl: './consultas-administrativo.html'
})
export class ConsultasAdministrativo {

  dataGraficos: any[] = [];
  filtrosParaInforme: any = null;
  graficaBase64: string = '';

  recibirDatosGrafica(event: any[]) {
    this.dataGraficos = event;
  }

  recibirDatosParaInforme(event: any) {
    console.log("📌 Datos enviados al PDF:", event);
    this.filtrosParaInforme = event;
  }

  recibirGrafica(base64: string) {
    console.log("Gráfica recibida desde graficos-administrativo");
    this.graficaBase64 = base64;
  }


}
