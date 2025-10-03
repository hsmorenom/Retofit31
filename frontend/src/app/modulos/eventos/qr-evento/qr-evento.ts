import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-evento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-evento.html'
})
export class QrEvento {

  // 🔹 Emitimos evento al padre para cerrar la vista
  @Output() cerrar = new EventEmitter<void>();
  @Input() evento: any; // <--- muy importante

  ngOnInit() {
    console.log('Evento recibido en QR:', this.evento);
  }

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
