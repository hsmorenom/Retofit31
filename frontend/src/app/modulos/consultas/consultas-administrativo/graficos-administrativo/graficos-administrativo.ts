import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-graficos-administrativo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graficos-administrativo.html'
})
export class GraficosAdministrativo implements OnChanges {

  @Input() dataGraficos: any[] = [];
  @Output() graficaGenerada = new EventEmitter<string>();

  tipoGrafica: 'barras' | 'torta' = 'barras';
  grafica: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataGraficos.length > 0) {
      this.generarGrafica();
    }
  }

  generarGrafica() {

    if (!this.dataGraficos || this.dataGraficos.length === 0) return;

    // 🟢 Esperar a que Angular pinte el canvas en el DOM
    setTimeout(() => {

      const canvas = document.getElementById('graficaAdministrativo') as HTMLCanvasElement;

      if (!canvas) {
        console.error("❌ No se encontró el canvas con ID 'graficaAdministrativo'");
        return;
      }

      const labels = this.dataGraficos.map(x => x.etiqueta);
      const valores = this.dataGraficos.map(x => x.valor);

      // 🔥 Destruir gráfica previa para evitar superposición
      if (this.grafica) {
        this.grafica.destroy();
        this.grafica = null;
      }

      const tipo = this.tipoGrafica === 'barras' ? 'bar' : 'pie';

      const colores = [
        '#7CE54F', '#004D00', '#00A86B', '#A5F59C',
        '#008040', '#66C266', '#00994D', '#00CC66'
      ].slice(0, valores.length);

      // 🟢 Crear nueva gráfica
      this.grafica = new Chart(canvas, {
        type: tipo,
        data: {
          labels,
          datasets: [{
            label: 'Usuarios',
            data: valores,
            backgroundColor: colores,
            borderColor: '#222',
            borderWidth: 1
          }]
        },
        options: {
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

      // 🟢 Exportar Base64 de la gráfica
      try {
        const base64 = this.grafica.toBase64Image();
        this.graficaGenerada.emit(base64);
      } catch (err) {
        console.warn("⚠ No se pudo generar imagen Base64 todavía");
      }

    }, 100); // ⏳ Tiempo mínimo para asegurar renderizado

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
    enlace.download = 'grafica_administrativo.png';
    enlace.href = this.grafica.toBase64Image();
    enlace.click();
  }

  obtenerImagenBase64() {
    return this.grafica ? this.grafica.toBase64Image() : null;
  }

}
