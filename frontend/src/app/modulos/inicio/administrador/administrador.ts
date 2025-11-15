import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { UsuarioService } from '../../../services/usuario';
import { ClienteService } from '../../../services/cliente';
import { EventosService } from '../../../services/eventos';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administrador.html'
})
export class Administrador implements OnInit {

  usuariosActivos = 0;
  nuevosRegistros = 0;
  eventosProximosCantidad = 0;


  constructor(
    private usuarioService: UsuarioService
    , private clienteService: ClienteService
    , private eventosService: EventosService
  ) {}

  ngOnInit(): void {
    this.cargarUsuariosActivos();
    this.cargarNuevosRegistros();
    this.cargarEventosProximos();
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


}
