import { CommonModule } from '@angular/common';
import { Input, Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../../../services/eventos';

@Component({
  selector: 'app-editar-evento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-evento.html'
})
export class EditarEvento {
  @Input() evento: any; //Aca se recibe el evento que el padre seleccionó
  // 🔹 Emitimos evento al padre para cerrar la vista
  @Output() cerrar = new EventEmitter<void>();

  // Campos para el formulario
  nombre_evento: string = '';
  fecha_actividad: string = '';
  hora_inicio: string = '';
  hora_fin: string = '';
  instructor: string = '';
  lugar_de_actividad: string = '';
  observaciones: string = '';

  mostrarError = false;

  constructor(private eventosService: EventosService) { }

  ngOnInit(): void {
    if (this.evento) {
      this.cargarDatos();

    }
  }
  cargarDatos() {
    this.nombre_evento = this.evento.NOMBRE_EVENTO;
    this.fecha_actividad = this.evento.FECHA_ACTIVIDAD;
    this.hora_inicio = this.evento.HORA_INICIO;
    this.hora_fin = this.evento.HORA_FIN;
    this.instructor = this.evento.INSTRUCTOR;
    this.lugar_de_actividad = this.evento.LUGAR_DE_ACTIVIDAD;
    this.observaciones = this.evento.OBSERVACIONES;
  }

  // 🔹 Lógica de guardado (más adelante puedes conectar al servicio)
  guardarEvento(): void {

    if (!this.evento || !this.evento.ID_EVENTOS) {
      alert('No se encontró el ID del evento.');
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

    // Preparamos los datos a enviar
    const datosActualizados = {
      NOMBRE_EVENTO: this.nombre_evento,
      FECHA_ACTIVIDAD: this.fecha_actividad,
      HORA_INICIO: this.hora_inicio,
      HORA_FIN: this.hora_fin,
      INSTRUCTOR: this.instructor,
      LUGAR_DE_ACTIVIDAD: this.lugar_de_actividad,
      OBSERVACIONES: this.observaciones
    };

    // Llamamos al método PUT del servicio
    this.eventosService.editar(this.evento.ID_EVENTOS, datosActualizados).subscribe({
      next: (res) => {
        alert(res.mensaje || 'Evento actualizado correctamente.');
        this.cerrarVentana(); // Cierra después de guardar
      },
      error: (error) => {
        console.error('Error al actualizar el evento:', error);
        alert('Ocurrió un error al actualizar el evento.');
      }
    });



  }

  // 🔹 Cierra el formulario
  cerrarVentana(): void {
    this.cerrar.emit();
  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }



}

