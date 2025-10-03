import { Component, Output, EventEmitter, input, Input } from '@angular/core';

@Component({
  selector: 'app-agregar-evento',
  standalone: true,
  templateUrl: './agregar-evento.html'
})
export class AgregarEvento {
  @Input() cerrarAgregarEvento = true;
  

  
  
}

