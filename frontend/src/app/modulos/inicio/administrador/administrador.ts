import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { UsuarioService } from '../../../services/usuario';
import { ClienteService } from '../../../services/cliente';
import { EventosService } from '../../../services/eventos';
import { AntropometricosService } from '../../../services/antropometricos';
import { Chart, registerables } from 'chart.js';Chart.register(...registerables);

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administrador.html'
})
export class Administrador implements OnInit, AfterViewInit {

  usuariosActivos = 0;
  nuevosRegistros = 0;
  eventosProximosCantidad = 0;

promPeso = 0;
promIMC = 0;
promPGC = 0;
promCuello = 0;



  constructor(
    private usuarioService: UsuarioService
    , private clienteService: ClienteService
    , private eventosService: EventosService
    , private antropometricosService: AntropometricosService
  ) {}

  ngOnInit(): void {
    this.cargarUsuariosActivos();
    this.cargarNuevosRegistros();
    this.cargarEventosProximos();
    this.cargarTendenciaAntropometrica();
    this.cargarPromedios();
  }
  ngAfterViewInit(): void {
    // Esperar a que Angular dibuje el canvas
    setTimeout(() => {
      this.generarGraficaRadar();
    }, 200);
  }

  cargarUsuariosActivos() {
    this.usuarioService.consultar().subscribe({
      next: (data: any[]) => {

        if (!data || data.length === 0) {
          this.usuariosActivos = 0;
          return;
        }

        // Filtrar usuarios activos (ESTADO = 1)
        this.usuariosActivos = data.filter(u => Number(u.ESTADO) === 1).length;

        console.log("Usuarios activos hoy:", this.usuariosActivos);
      },
      error: err => console.error("Error cargando usuarios:", err)
    });
  }

  cargarNuevosRegistros() {
  this.clienteService.consultar().subscribe({
    next: (clientes: any[]) => {

      if (!clientes || clientes.length === 0) {
        this.nuevosRegistros = 0;
        return;
      }

      const hoy = new Date();
      const hace30dias = new Date();
      hace30dias.setDate(hoy.getDate() - 30);  // ⬅️ Últimos 30 días

      // Filtrar por FECHA_REGISTRO dentro del rango
      const nuevos = clientes.filter(cliente => {

        const fechaRegistro = new Date(cliente.FECHA_REGISTRO);

        return fechaRegistro >= hace30dias && fechaRegistro <= hoy;

      });

      this.nuevosRegistros = nuevos.length;

      console.log("📌 Nuevos registros (últimos 30 días):", this.nuevosRegistros);
    },
    error: err => console.error("❌ Error cargando clientes:", err)
  });
}

cargarEventosProximos() {
  this.eventosService.consultar().subscribe({
    next: (data: any[]) => {

      if (!data || data.length === 0) {
        this.eventosProximosCantidad = 0;
        return;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // limpiar hora

      // Filtrar solo eventos desde hoy en adelante
      const futuros = data.filter(evento => {
        const fechaEvento = new Date(evento.FECHA_ACTIVIDAD);
        fechaEvento.setHours(0, 0, 0, 0);
        return fechaEvento >= hoy;
      });

      this.eventosProximosCantidad = futuros.length;

      console.log("📌 Eventos próximos:", this.eventosProximosCantidad);
    },
    error: err => console.error("❌ Error consultando eventos:", err)
  });
}

cargarTendenciaAntropometrica() {
  this.antropometricosService.consultar().subscribe({
    next: (data: any[]) => {

      if (!data || data.length === 0) {
        return;
      }

      // Sumar valores reales
      let sumaPeso = 0;
      let sumaIMC = 0;
      let sumaPGC = 0;
      let sumaCuello = 0;

      data.forEach(reg => {
        sumaPeso += Number(reg.PESO);
        sumaIMC += Number(reg.IMC);
        sumaPGC += Number(reg.PGC);
        sumaCuello += Number(reg.CUELLO);
      });

      const total = data.length;

      // Calcular promedios
      this.promPeso = +(sumaPeso / total).toFixed(1);
      this.promIMC = +(sumaIMC / total).toFixed(1);
      this.promPGC = +(sumaPGC / total).toFixed(1);
      this.promCuello = +(sumaCuello / total).toFixed(1);

      // Crear gráfico
      this.graficaAntropometrica();
    },

    error: err => console.error("Error cargando antropometría:", err)
  });
}

graficaAntropometrica() {
  const ctx = document.getElementById('graficaAntropometrica') as HTMLCanvasElement;

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['peso', 'IMC', 'PGC', 'Circunferencia cuello'],
      datasets: [
        {
          label: 'Promedios',
          data: [this.promPeso, this.promIMC, this.promPGC, this.promCuello],

          backgroundColor: 'rgba(34,197,94,0.3)',       // verde suave
          borderColor: '#16a34a',                       // verde fuerte
          pointBackgroundColor: '#16a34a',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderWidth: 3,
          borderDash: [5, 5],                           // línea punteada
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          angleLines: {
            display: true,
            color: '#ddd'
          },
          grid: {
            color: '#eee'
          },
          suggestedMin: 0
        }
      }
    }
  });
}
cargarPromedios() {
    this.antropometricosService.consultar().subscribe({
      next: (data: any[]) => {

        if (!data || data.length === 0) return;

        let sPeso = 0, sIMC = 0, sPGC = 0, sCuello = 0;

        data.forEach(r => {
          sPeso += Number(r.PESO);
          sIMC += Number(r.IMC);
          sPGC += Number(r.PGC);
          sCuello += Number(r.CUELLO);
        });

        const total = data.length;

        this.promPeso = +(sPeso / total).toFixed(1);
        this.promIMC = +(sIMC / total).toFixed(1);
        this.promPGC = +(sPGC / total).toFixed(1);
        this.promCuello = +(sCuello / total).toFixed(1);

        console.log("Promedios:", this.promPeso, this.promIMC, this.promPGC, this.promCuello);
      }
    });
  }

  generarGraficaRadar() {
    const canvas: any = document.getElementById('graficaAntropometrica');

    if (!canvas) {
      console.error("⚠️ No se encontró el canvas graficaAntropometrica");
      return;
    }

    new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['peso', 'IMC', 'PGC', 'Circunferencia cuello'],
        datasets: [
          {
            label: 'Tendencias',
            data: [this.promPeso, this.promIMC, this.promPGC, this.promCuello],
            backgroundColor: 'rgba(34,197,94,0.3)',
            borderColor: '#16a34a',
            borderWidth: 3,
            borderDash: [5,5],
            pointBackgroundColor: '#16a34a'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            suggestedMin: 0,
            grid: { color: '#e5e7eb' },
            angleLines: { color: '#d1d5db' }
          }
        }
      }
    });
  }

}



