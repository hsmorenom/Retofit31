import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { UsuarioService } from '../../../services/usuario';
import { ClienteService } from '../../../services/cliente';
import { EventosService } from '../../../services/eventos';
import { AntropometricosService } from '../../../services/antropometricos';
import { AsistenciaService } from '../../../services/asistencia';
import { FotografiaService } from '../../../services/fotografia';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-asistente-admon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistente-admon.html'
})
export class AsistenteAdmon implements OnInit {
 usuariosActivos = 0;
  nuevosRegistros = 0;
  eventosProximosCantidad = 0;

asistenciaUltimos6Meses: number[] = [];
labelsAsistencia: string[] = [];
graficoAsistencia: any = null;

  promPeso = 0;
  promIMC = 0;
  promPGC = 0;
  promCuello = 0;

  radarChart: any;

  eventosDelMes = 0;
  clientesSinFoto = 0;

  nuevasFotos = 0;


  constructor(
    private usuarioService: UsuarioService,
    private clienteService: ClienteService,
    private eventosService: EventosService,
    private antropometricosService: AntropometricosService,
    private asistenciaService: AsistenciaService,
    private fotografiaService: FotografiaService
    
  ) {}

    ngOnInit(): void {
    this.cargarUsuariosActivos();
    this.cargarNuevosRegistros();
    this.cargarEventosProximos();
    this.cargarTendenciaAntropometrica(); 
    this.cargarTendenciaAsistencia();
    this.cargarEventosMesActual();   
    this.cargarClientesSinFoto(); 
    this.cargarNuevasFotos();
  }
  cargarNuevasFotos() {
  this.fotografiaService.consultar().subscribe({
    next: (fotos: any[]) => {

      const hoy = new Date();
      const hace30dias = new Date();
      hace30dias.setDate(hoy.getDate() - 30);

      this.nuevasFotos = fotos.filter(f => {
        const fecha = new Date(
          f.FECHA_REGISTRO || f.FECHA_INICIO || f.FECHA__REGISTRO
        );
        return fecha >= hace30dias && fecha <= hoy;
      }).length;

   
    }
  });
}

cargarTendenciaAsistencia() {
  this.asistenciaService.consultar().subscribe({
    next: (data: any[]) => {

      const hoy = new Date();
      const hace6Meses = new Date();
      hace6Meses.setMonth(hoy.getMonth() - 6);

      // 🔹 FILTRAR REGISTROS POR FECHA_ASISTENCIA
      const filtrados = data.filter(a => {
        const fecha = new Date(a.FECHA_ASISTENCIA);
        return fecha >= hace6Meses && fecha <= hoy;
      });

      // 🔹 FILTRAR SOLO LOS QUE ASISTIERON
      const validos = filtrados.filter(a =>
        a.NOTIFICACION.includes('Asistió') ||
        a.NOTIFICACION.includes('automáticamente')
      );

      // 🔹 AGRUPAR ASISTENCIAS POR MES
      const conteoPorMes: { [key: string]: number } = {};

      validos.forEach(as => {
        const f = new Date(as.FECHA_ASISTENCIA);

        // formato YYYY-MM para ordenar
        const key = `${f.getFullYear()}-${('0' + (f.getMonth() + 1)).slice(-2)}`;

        conteoPorMes[key] = (conteoPorMes[key] || 0) + 1;
      });

      // 🔹 ORDENAR LOS MESES
      const mesesOrdenados = Object.keys(conteoPorMes).sort();

      // 🔹 GENERAR LABELS Y DATOS PARA LA GRÁFICA
      this.labelsAsistencia = mesesOrdenados.map(m => this.nombreMes(Number(m.split('-')[1])));
      this.asistenciaUltimos6Meses = mesesOrdenados.map(m => conteoPorMes[m]);

      // 🔹 Generar gráfica
      this.generarGraficoAsistencia();
    }
  });
}



nombreMes(mes: number): string {
  const nombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return nombres[mes - 1];
}


  cargarUsuariosActivos() {
    this.usuarioService.consultar().subscribe({
      next: (data: any[]) => {
        this.usuariosActivos = data.filter(u => Number(u.ESTADO) === 1).length;
      }
    });
  }

  cargarNuevosRegistros() {
    this.clienteService.consultar().subscribe({
      next: (clientes: any[]) => {
        const hoy = new Date();
        const hace30dias = new Date();
        hace30dias.setDate(hoy.getDate() - 30);

        this.nuevosRegistros = clientes.filter(c => {
          const f = new Date(c.FECHA_REGISTRO);
          return f >= hace30dias && f <= hoy;
        }).length;
      }
    });
  }

  cargarEventosProximos() {
    this.eventosService.consultar().subscribe({
      next: (data: any[]) => {
        const hoy = new Date();
        hoy.setHours(0,0,0,0);

        this.eventosProximosCantidad = data.filter(e => {
          const f = new Date(e.FECHA_ACTIVIDAD);
          f.setHours(0,0,0,0);
          return f >= hoy;
        }).length;
      }
    });
  }

cargarTendenciaAntropometrica() {
  this.antropometricosService.consultar().subscribe({
    next: (data: any[]) => {

      const hoy = new Date();
      const hace6Meses = new Date();
      hace6Meses.setMonth(hoy.getMonth() - 6);

      // 🍃 Filtrar últimos 6 meses
      const ultimos = data.filter(r => {
        const fecha = new Date(r.FECHA_REGISTRO);
        return fecha >= hace6Meses && fecha <= hoy;
      });

      if (ultimos.length === 0) return;

      // 🍃 Filtrar solo valores válidos (>0)
      const pesoValidos   = ultimos.filter(r => Number(r.PESO) > 0);
      const imcValidos    = ultimos.filter(r => Number(r.INDICE_DE_MASA_CORPORAL) > 0);
      const pgcValidos    = ultimos.filter(r => Number(r.PORCENTAJE_GRASA_CORPORAL) > 0);
      const cuelloValidos = ultimos.filter(r => Number(r.CIRCUNFERENCIA_CUELLO) > 0);

      // 🍃 Sumar cada categoría
      const sPeso   = pesoValidos.reduce((a, r) => a + Number(r.PESO), 0);
      const sIMC    = imcValidos.reduce((a, r) => a + Number(r.INDICE_DE_MASA_CORPORAL), 0);
      const sPGC    = pgcValidos.reduce((a, r) => a + Number(r.PORCENTAJE_GRASA_CORPORAL), 0);
      const sCuello = cuelloValidos.reduce((a, r) => a + Number(r.CIRCUNFERENCIA_CUELLO), 0);

      // 🍃 Calcular promedios REALES (sin ceros)
      this.promPeso   = pesoValidos.length   ? +(sPeso / pesoValidos.length).toFixed(1) : 0;
      this.promIMC    = imcValidos.length    ? +(sIMC / imcValidos.length).toFixed(1) : 0;
      this.promPGC    = pgcValidos.length    ? +(sPGC / pgcValidos.length).toFixed(1) : 0;
      this.promCuello = cuelloValidos.length ? +(sCuello / cuelloValidos.length).toFixed(1) : 0;

     

      this.generarGraficaRadar();
    }
  });
}

cargarEventosMesActual() {
  this.eventosService.consultar().subscribe({
    next: (eventos: any[]) => {

      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const anioActual = hoy.getFullYear();

      this.eventosDelMes = eventos.filter(e => {
        const fecha = new Date(e.FECHA_ACTIVIDAD);
        return (
          fecha.getMonth() === mesActual &&
          fecha.getFullYear() === anioActual
        );
      }).length;

  
    }
  });
}
cargarClientesSinFoto() {
  this.clienteService.consultar().subscribe({
    next: (clientes: any[]) => {

      this.fotografiaService.consultar().subscribe({
        next: (fotos: any[]) => {

          const idsConFoto = fotos.map(f => Number(f.CLIENTE));

          // clientes que NO están en la tabla de fotos
          const sinFoto = clientes.filter(c => !idsConFoto.includes(Number(c.ID_CLIENTE)));

          this.clientesSinFoto = sinFoto.length;
        }
      });
    }
  });
}




  generarGraficaRadar() {
    const canvas: any = document.getElementById('graficaAntropometrica');
    if (!canvas) return;

    // Si ya existe un gráfico previo, destruirlo
    if (this.radarChart) this.radarChart.destroy();

    this.radarChart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Peso', 'IMC', 'PGC', 'Circunferencia cuello'],
        datasets: [
          {
            label: 'Tendencia últimos 6 meses',
            data: [this.promPeso, this.promIMC, this.promPGC, this.promCuello],
            backgroundColor: 'rgba(34,197,94,0.25)',
            borderColor: '#16a34a',
            borderWidth: 3,
            borderDash: [5,5],
            pointBackgroundColor: '#16a34a',
            pointRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            suggestedMin: 0,
            grid: { color: '#ccc' },
            angleLines: { color: '#ccc' }
          }
        }
      }
    });
  }

  generarGraficoAsistencia() {
  const canvas: any = document.getElementById('graficaAsistencia');

  if (!canvas) return;

  if (this.graficoAsistencia)
    this.graficoAsistencia.destroy();

  this.graficoAsistencia = new Chart(canvas, {
    type: 'line',
    data: {
      labels: this.labelsAsistencia,
      datasets: [{
        label: "Asistencias por mes (últimos 6 meses)",
        data: this.asistenciaUltimos6Meses,
        borderColor: "#16a34a",
        backgroundColor: "rgba(34,197,94,0.3)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#16a34a",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

}
