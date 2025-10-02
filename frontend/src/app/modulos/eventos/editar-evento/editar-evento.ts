import { Input, Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-editar-evento',
  standalone: true,
  templateUrl: './editar-evento.html'
})
export class EditarEvento {
  @Input() evento: any;
  @Output() cerrar = new EventEmitter<void>();
}

