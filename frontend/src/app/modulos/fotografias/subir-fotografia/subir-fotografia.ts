import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-subir-fotografia',
  imports: [],
  templateUrl: './subir-fotografia.html'
})
export class SubirFotografia {

  // Creamos un evento que avisará al padre
  @Output() volver = new EventEmitter<void>();

  // Función que se llama al hacer clic en "VOLVER"
  onVolver() {
    this.volver.emit(); // Envía el evento al componente padre
  }  
}
