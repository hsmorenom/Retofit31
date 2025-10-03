import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-agregar-evento',
  standalone: true,
  templateUrl: './agregar-evento.html'
})
export class AgregarEvento {
  // 🔹 Emitimos evento al padre para cerrar la vista
  @Output() cerrar = new EventEmitter<void>();

  // 🔹 Cierra el formulario
  cerrarVentana(): void {
    this.cerrar.emit();
  }

  // 🔹 Lógica de guardado (más adelante puedes conectar al servicio)
  guardarEvento(): void {
    // Aquí va la lógica de guardado al backend
    alert('Evento guardado correctamente.');
    this.cerrarVentana(); // Cierra al guardar
  }
}
