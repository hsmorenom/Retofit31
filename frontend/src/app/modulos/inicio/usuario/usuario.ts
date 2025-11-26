import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { AntropometricosService } from '../../../services/antropometricos';
import { EventosService } from '../../../services/eventos';
import { FotografiaService } from '../../../services/fotografia';
import { Chart, registerables } from 'chart.js';Chart.register(...registerables);

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [ CommonModule 

  ],
  templateUrl: './usuario.html'
})
export class Usuario implements OnInit {

  pesos: number[] = [];
  fechasPeso: string[] = [];

  eventosProximos: any[] = [];

  // Datos antropométricos
  peso = 0;
  pgc = 0;
  imc = 0;
  cintura = 0;
  cuello = 0;
  altura = 0;

  // Foto última frontal
  fotoFrontal: string = '';

  identificacion: string = '';  
  idCliente: number = 0;

  constructor(
    private antropometricos: AntropometricosService,
    private fotografia: FotografiaService,
    private eventosService: EventosService
  ) {}

  ngOnInit(): void {

    // Datos del login
    this.identificacion = String(localStorage.getItem('identificacion'));
    this.idCliente = Number(localStorage.getItem('id_cliente'));
    this.cargarTendenciaPeso();
    this.cargarProximosEventos(); 

    if (!this.idCliente) {
      console.error("❌ No existe id_cliente en el localStorage.");
      return;
    }

    this.cargarUltimoRegistroAntropometrico();
    this.cargarUltimaFotoFrontal();
  }

  // ============================================
  //    ÚLTIMO REGISTRO ANTROPOMÉTRICO
  // ============================================
  cargarUltimoRegistroAntropometrico() {

    this.antropometricos.filtrarIdCliente(this.idCliente).subscribe({
      next: (data: any[]) => {

        if (!data || data.length === 0) {
          console.warn("⚠ Este cliente no tiene registros antropométricos.");
          return;
        }


        // Ordenar por fecha
        data.sort((a, b) =>
          new Date(a.FECHA_REGISTRO).getTime() - new Date(b.FECHA_REGISTRO).getTime()
        );

        const ultimo = data[data.length - 1];

        this.peso    = Number(ultimo.PESO);
        this.pgc     = Number(ultimo.PGC);
        this.imc     = Number(ultimo.IMC);
        this.cuello  = Number(ultimo.CUELLO);
        this.cintura = Number(ultimo.CINTURA);
        this.altura  = Number(ultimo.ALTURA);

      },
      error: (err) => console.error("❌ Error consultando antropometría:", err)
    });
  }

  // ============================================
  //    ÚLTIMA FOTO FRONTAL
  // ============================================
cargarUltimaFotoFrontal() {

  this.fotografia.filtrar(this.idCliente).subscribe({
    next: (data: any[]) => {


      if (!data || data.length === 0) {
        console.warn("⚠ Este cliente no tiene fotos registradas.");
        return;
      }

      // Ordenar correctamente por FECHA__REGISTRO
      data.sort((a, b) =>
        new Date(a.FECHA__REGISTRO).getTime() - new Date(b.FECHA__REGISTRO).getTime()
      );

      const ultima = data[data.length - 1];

      // 🔥 Construir URL completa (la que Angular sí puede mostrar)
      this.fotoFrontal = 
        `http://localhost:8000/backend/${ultima.URL_FOTO_FRONTAL}`;

    },

    error: (err) => {
      console.error("❌ Error consultando fotografías:", err);
    }
  });

}

cargarTendenciaPeso() {

  this.antropometricos.filtrarIdCliente(this.idCliente).subscribe({
    next: (data: any[]) => {

      if (!data || data.length === 0) return;

      // Ordenar por fecha
      data.sort((a, b) =>
        new Date(a.FECHA_REGISTRO).getTime() - new Date(b.FECHA_REGISTRO).getTime()
      );

      // Tomar últimos 10
      const ultimos = data.slice(-10);

      // Guardar data
      this.pesos = ultimos.map(x => Number(x.PESO));
      this.fechasPeso = ultimos.map(x => x.FECHA_REGISTRO);

      // Crear gráfico
      this.generarGraficoPeso();
    },
    error: err => console.error(err)
  });

}


generarGraficoPeso() {

  const ctx = document.getElementById('graficoPeso') as HTMLCanvasElement;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: this.fechasPeso,
      datasets: [
        {
          label: 'Peso (kg)',
          data: this.pesos,
          borderWidth: 3,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(34,197,94,0.3)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: false }
      }
    }
  });

}
cargarProximosEventos() {
  this.eventosService.consultar().subscribe({
    next: (data: any[]) => {

      if (!data || data.length === 0) {
        console.warn("⚠ No hay eventos registrados");
        return;
      }

      // Ordenar por fecha de actividad
      data.sort((a, b) => 
        new Date(a.FECHA_ACTIVIDAD).getTime() - new Date(b.FECHA_ACTIVIDAD).getTime()
      );

      // Obtener solo eventos futuros (opcional)
      const hoy = new Date();

      const futuros = data.filter(ev =>
        new Date(ev.FECHA_ACTIVIDAD) >= hoy
      );

      // Tomar solo los próximos 5
      this.eventosProximos = futuros.slice(0, 5);

    },
    error: (err) => console.error(err)
  });
}



}
