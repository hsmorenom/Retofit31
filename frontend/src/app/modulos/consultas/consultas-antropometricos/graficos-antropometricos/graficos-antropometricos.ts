import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-graficos-antropometricos',
  standalone: true,
  templateUrl: './graficos-antropometricos.html'
})
export class GraficosAntropometricos implements OnChanges {

  @Input() graficaData: any = null;
  @Output() graficaGenerada = new EventEmitter<string>();


  chartBar: any;
  chartRadar: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.graficaData) {
      this.limpiarGraficas();
      return;
    }

    this.renderizarGraficas();
  }


  // ===============================
  // 🎨 RENDERIZAR TODAS LAS GRÁFICAS
  // ===============================
  renderizarGraficas() {

    // 🔥 Limpiar gráficos previos
    if (this.chartBar) this.chartBar.destroy();
    if (this.chartRadar) this.chartRadar.destroy();

    const { tipoInforme, datos, metrica, radar } = this.graficaData;

    // === LISTADO DETALLADO ===
    if (tipoInforme === 'listado_detallado') {
      this.graficaListadoDetallado(datos, metrica);

      if (radar) {
        this.graficaRadarListado(radar);
      }
      return;
    }

    // === PROMEDIOS (general / por sexo) ===
    this.graficaPromedios(datos);
  }

  // ============================
  // 📊 BARRAS – LISTADO DETALLADO
  // ============================
  graficaListadoDetallado(datos: any[], metrica: string) {

    if (!datos || !Array.isArray(datos)) return;
    const labels = datos.map(d => `${d.NOMBRES} ${d.APELLIDOS}`);
    const valores = datos.map(d => Number(d.VALOR));

    const ctx = document.getElementById('chartBar') as HTMLCanvasElement;

    const colores = [
      '#7CE54F', '#004D00', '#00A86B', '#A5F59C', '#008040', '#66C266'
    ].slice(0, valores.length);

    this.chartBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `Valores de ${metrica}`,
          data: valores,
          backgroundColor: colores
        }]
      }
    });

    setTimeout(() => {
      const canvas = document.getElementById('chartBar') as HTMLCanvasElement;
      if (canvas) {
        const base64 = canvas.toDataURL('image/png');
        this.graficaGenerada.emit(base64);
      }
    }, 200);

  }

  // ============================
  // 📊 BARRAS – PROMEDIOS
  // ============================
  graficaPromedios(datos: any[]) {

    if (!datos || !Array.isArray(datos)) return;

    const labels = datos.map(d => d.ETIQUETA);
    const valores = datos.map(d => Number(d.VALOR));

    const ctx = document.getElementById('chartBar') as HTMLCanvasElement;

    const colores = [
      '#7CE54F', '#004D00', '#00A86B', '#A5F59C', '#008040', '#66C266'
    ].slice(0, valores.length);

    this.chartBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Promedios',
          data: valores,
          backgroundColor: colores
        }]
      }
    });

    setTimeout(() => {
      const canvas = document.getElementById('chartBar') as HTMLCanvasElement;
      if (canvas) {
        const base64 = canvas.toDataURL('image/png');
        this.graficaGenerada.emit(base64);
      }
    }, 200);

  }

  // ============================
  // 📍 RADAR – LISTADO DETALLADO
  // ============================
  graficaRadarListado(radarData: any) {

    const ctx = document.getElementById('chartRadar') as HTMLCanvasElement;

    this.chartRadar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: radarData.labels,
        datasets: [{
          label: 'Valores antropométricos',
          data: radarData.values,
          borderColor: '#004D00',
          backgroundColor: 'rgba(0, 150, 0, 0.3)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true
      }
    });

    setTimeout(() => {
      const canvas = document.getElementById('chartRadar') as HTMLCanvasElement;
      if (canvas) {
        const base64 = canvas.toDataURL('image/png');
        this.graficaGenerada.emit(base64);
      }
    }, 200);

  }

  limpiarGraficas() {
    if (this.chartBar) {
      this.chartBar.destroy();
      this.chartBar = null;
    }

    if (this.chartRadar) {
      this.chartRadar.destroy();
      this.chartRadar = null;
    }

    // Limpia los canvas manualmente
    const bar = document.getElementById('chartBar') as HTMLCanvasElement;
    const radar = document.getElementById('chartRadar') as HTMLCanvasElement;

    if (bar) {
      const ctx = bar.getContext('2d');
      ctx?.clearRect(0, 0, bar.width, bar.height);
    }

    if (radar) {
      const ctx = radar.getContext('2d');
      ctx?.clearRect(0, 0, radar.width, radar.height);
    }
  }




}
