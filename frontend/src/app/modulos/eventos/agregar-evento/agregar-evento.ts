import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventosService } from '../../../services/eventos';

@Component({
  selector: 'app-agregar-evento',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './agregar-evento.html'
})
export class AgregarEvento {
  @Output() cerrar = new EventEmitter<void>();

  // 🔹 Campos del formulario
  nombre_evento = '';
  fecha_actividad: string = '';
  hora_inicio = '';
  hora_fin = '';
  instructor = '';
  lugar_de_actividad = '';
  observaciones = '';

  mostrarGenerarQr = false;
  eventoGuardado = false;

  constructor(private eventosService: EventosService) { }

  // 🔹 Guarda el evento real en la BD
  guardarEvento(): void {
    const idUsuario = localStorage.getItem('idUsuario'); // viene del login
    if (!idUsuario) {
      alert('No se encontró el usuario logueado.');
      return;
    }

    if (!this.fecha_actividad) {
      alert('Por favor selecciona una fecha.');
      return;
    }

    // ✅ Aseguramos formato correcto
    const fechaISO = new Date(this.fecha_actividad).toISOString().split('T')[0];

    const data = {
      NOMBRE_EVENTO: this.nombre_evento,
      FECHA_ACTIVIDAD: fechaISO,
      HORA_INICIO: this.hora_inicio,
      HORA_FIN: this.hora_fin,
      INSTRUCTOR: this.instructor,
      LUGAR_DE_ACTIVIDAD: this.lugar_de_actividad,
      OBSERVACIONES: this.observaciones,
      USUARIO: idUsuario
    };

    this.eventosService.insertar(data).subscribe({
      next: (res) => {
        if (res.resultado === 'OK') {
          alert('✅ Evento guardado correctamente.');
          this.eventoGuardado = true;
          this.mostrarGenerarQr = true; // habilita el botón de generar QR
        } else {
          alert('❌ Error al guardar: ' + res.mensaje);
        }
      },
      error: (err) => {
        console.error('Error al insertar evento:', err);
        alert('Error al guardar evento.');
      }
    });
  }

  generarQR(): void {
    alert('Código QR generado con éxito.');
  }

  cerrarVentana(): void {
    this.eventoGuardado = false;
    this.cerrar.emit();
  }
}
