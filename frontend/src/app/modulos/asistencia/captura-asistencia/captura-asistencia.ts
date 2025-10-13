import { Component } from '@angular/core';
import { AsistenciaService } from '../../../services/asistencia';

@Component({
  selector: 'app-captura-asistencia',
  standalone: true,
  templateUrl: './captura-asistencia.html',
})
export class CapturaAsistencia {
  constructor(
    private asistenciaService: AsistenciaService
  ) { }

  registrarAsistencia(idCliente: number, idEvento: number) {
    const data = {
      id_cliente: idCliente,
      id_evento: idEvento,
      fecha_registro: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    this.asistenciaService.insertar(data).subscribe({
      next: (res) => {
        console.log('Asistencia registrada:', res);
        alert('✅ Asistencia registrada correctamente');
      },
      error: (err) => {
        console.error('Error al registrar asistencia:', err);
        alert('❌ Hubo un error al registrar la asistencia');
      }
    });
  }
}

