import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Evolucion_dataService } from '../../../services/evolucion-data';

Chart.register(...registerables);

@Component({
  selector: 'app-evolucion-antropometrica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evolucion-antropometrica.html'
})
export class EvolucionAntropometrica {

  registros: any[] = [];
  grafica: any;

  nombreCliente: string = '';
  nombreColumnaDato: string = '';
  tipoDatoSeleccionado: string = '';

  constructor(
    private evolucionDataService: Evolucion_dataService,
    private router: Router
  ) { }

  ngOnInit() {
    this.registros = this.evolucionDataService.datosSeleccionados;
    this.tipoDatoSeleccionado = this.evolucionDataService.tipoDatoSeleccionado;

    // ✅ Si no hay datos, no dibujamos nada todavía
    if (!this.registros || this.registros.length === 0) {
      return;
    }

    // ✅ Ahora sí podemos tomar info del cliente
    const r = this.registros[0];
    this.nombreCliente = `${r.NOMBRES ?? ''} ${r.APELLIDOS ?? ''}`.trim();


    const nombres: any = {
      PESO: "Peso corporal (Kg)",
      IMC: "Índice de masa corporal (IMC)",
      PGC: "Porcentaje de grasa corporal (%)",
      CUELLO: "Circunferencia de cuello (cm)",
      CINTURA: "Circunferencia de cintura (cm)",
      CADERA: "Circunferencia de cadera (cm)"
    };

    this.nombreColumnaDato = nombres[this.tipoDatoSeleccionado] ?? '';

    if (this.tipoDatoSeleccionado === 'PESO') {
      this.generarGraficaPeso();
    }
  }

  ngOnDestroy() {
    this.grafica?.destroy();
  }




  generarGraficaPeso() {
    const etiquetas = this.registros.map(r => {
      const partes = r.FECHA_REGISTRO.split("-");
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/mm/yyyy
    });

    const valores = this.registros.map(r => Number(r.PESO));

    const canvas: any = document.getElementById('graficaEvolucion');
    const ctx = canvas.getContext('2d');

    if (this.grafica) this.grafica.destroy();

    this.grafica = new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Peso (Kg)',
          data: valores,
          borderWidth: 3,
          borderColor: '#004D00',
          backgroundColor: 'rgba(124, 229, 79, 0.4)',
          pointBackgroundColor: '#004D00',
          pointBorderColor: '#004D00',
          tension: 0.3
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  }

  exportarGrafica() {
    const enlace = document.createElement('a');
    enlace.href = this.grafica.toBase64Image();
    enlace.download = `Evolucion_Peso_${new Date().getTime()}.png`;
    enlace.click();
  }

}
