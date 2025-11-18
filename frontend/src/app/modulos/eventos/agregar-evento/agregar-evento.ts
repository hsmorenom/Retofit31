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
  qrGenerado = false;
  idEventoCreado: number | null = null;
  mostrarError = false;

  constructor(private eventosService: EventosService) { }

  // 🔹 Guarda el evento real en la BD
  guardarEvento(): void {
    const idUsuario = localStorage.getItem('idUsuario'); // viene del login
    if (!idUsuario) {
      alert('No se encontró el usuario logueado.');
      return;
    }

    if (!this.nombre_evento) {
      alert('Por favor nombra el evento.');
      this.mostrarError = true;
      return;
    }

    if (!this.fecha_actividad) {
      alert('Por favor selecciona una fecha.');
      this.mostrarError = true;
      return;
    }

    if (!this.hora_inicio) {
      alert('Por favor ajusta la hora de inicio.');
      this.mostrarError = true;
      return;
    }

    if (!this.hora_fin) {
      alert('Por favor ajusta la hora final.');
      this.mostrarError = true;
      return;
    }

    if (!this.instructor) {
      alert('Por favor nombra un instructor.');
      this.mostrarError = true;
      return;
    }

    if (!this.lugar_de_actividad) {
      alert('Por favor nombra el lugar del evento.');
      this.mostrarError = true;
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
        console.log('📦 Respuesta del backend:', res); // 👈 agrega esto
        if (res.resultado === 'OK') {
          alert('✅ Evento guardado correctamente.');
          this.eventoGuardado = true;
          this.idEventoCreado = Number(res.id_evento); //  Guarda el ID que viene del backend
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

    if (!this.eventoGuardado || !this.idEventoCreado) {
      alert('⚠️ Primero guarda el evento antes de generar el QR.');
      return;
    }

    const idEvento = this.idEventoCreado;



    this.eventosService.generarQR(idEvento).subscribe({
      next: (res) => {
        if (res.resultado === 'OK') {
          alert('✅ QR generado correctamente.');
          this.qrGenerado = true;
          console.log('📁 URL del QR:', res.qr);
        } else {
          alert('❌ ' + res.mensaje);
        }
      },
      error: (err) => {
        console.error('Error al generar QR:', err);
        alert('⚠️ Hubo un problema al generar el QR.');
      }
    });
  }



  cerrarVentana(): void {
    // Si el evento ya fue guardado, pero el QR no se generó
    if (this.eventoGuardado && !this.mostrarGenerarQr) {
      alert('⚠️ No puedes cerrar esta ventana hasta generar el código QR del evento.');
      return;
    }

    // Si aún no se ha guardado el evento
    if (!this.eventoGuardado) {
      alert('⚠️ Debes guardar el evento antes de cerrarlo.');
      return;
    }

    // Si todo está correcto (evento guardado y QR generado)
    this.cerrar.emit();
  }
  cancelarRegistro(): void {
    this.cerrar.emit();
  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }

  

}
