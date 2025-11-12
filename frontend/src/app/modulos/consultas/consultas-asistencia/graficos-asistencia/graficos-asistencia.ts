import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AsistenciaService } from '../../../../services/asistencia';


Chart.register(...registerables);


@Component({
  selector: 'app-graficos-asistencia',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './graficos-asistencia.html'
})
export class GraficosAsistencia implements OnChanges {
  @Input() dataGraficos: any[] = [];
  @Output() graficaGenerada = new EventEmitter<string>();


  tipoGrafica: 'barras' | 'torta' = 'barras';
  grafica: any;

  constructor(
    private asistenciaService: AsistenciaService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataGraficos.length > 0) {
      this.generarGrafica();
    }
  }

  generarGrafica() {

    if (!this.dataGraficos || this.dataGraficos.length === 0) return;

    const labels = this.dataGraficos.map(x => x.NOMBRES + ' ' + x.APELLIDOS);
    const valores = this.dataGraficos.map(x =>
      Number(String(x.RESULTADO).replace('%', ''))
    );

    // Destruir la gráfica anterior
    if (this.grafica) this.grafica.destroy();

    const ctx = document.getElementById('graficaAsistencia') as HTMLCanvasElement;

    // Seleccionar tipo de gráfica dinámicamente
    const tipo = this.tipoGrafica === 'barras' ? 'bar' : 'pie';

    // Colores dinámicos (propios de cada usuario/valor)
    const colores = [
      '#7CE54F', '#004D00', '#00A86B', '#A5F59C', '#008040', '#66C266'
    ].slice(0, valores.length);

    this.grafica = new Chart(ctx, {
      type: tipo,
      data: {
        labels,
        datasets: [{
          label: 'Resultado',
          data: valores,
          backgroundColor: colores,
          borderColor: '#222',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            ticks: {
              stepSize: 1,        // Fuerza incrementos de 1
              precision: 0,       // Sin decimales
              callback: function (value) {
                return Number.isInteger(value) ? value : null;
              }
            },
            beginAtZero: true
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });

    // 🔥 Emitir imagen final para el PDF
    const imagenBase64 = this.grafica.toBase64Image();
    this.graficaGenerada.emit(imagenBase64);
  }


  cambiarTipoGrafica(tipo: 'barras' | 'torta') {
    this.tipoGrafica = tipo;
    this.generarGrafica();
  }
  exportarGrafica() {
    if (!this.grafica) {
      alert("No hay gráfica para exportar");
      return;
    }

    const enlace = document.createElement('a');
    enlace.download = 'grafica_asistencia.png';
    enlace.href = this.grafica.toBase64Image();
    enlace.click();
  }

  obtenerImagenBase64() {
    if (!this.grafica) return null;
    return this.grafica.toBase64Image();
  }



}
