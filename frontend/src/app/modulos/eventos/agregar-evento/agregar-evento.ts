import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-agregar-evento',
  standalone: true,
  templateUrl: './agregar-evento.html'
})
export class AgregarEvento {
  @Output() cerrar = new EventEmitter<void>();
}

