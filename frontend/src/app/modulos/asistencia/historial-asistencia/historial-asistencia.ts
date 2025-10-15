import { Component } from '@angular/core';

@Component({
  selector: 'app-historial-asistencia',
  standalone: true,
  imports: [],
  templateUrl: './historial-asistencia.html'
})
export class HistorialAsistencia {

  mostrarHistorialUsuario = false

  buscarUsuario() {

  }

  toggleConsulta(): void {
    this.mostrarHistorialUsuario = !this.mostrarHistorialUsuario;
    this.consultarHistorial();
  }

  consultarHistorial() {

  }

}
