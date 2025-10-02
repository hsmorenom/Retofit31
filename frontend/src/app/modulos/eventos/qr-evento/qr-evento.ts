import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-evento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-evento.html'
})
export class QrEvento {
  @Input() evento: any; // <--- muy importante

  ngOnInit() {
    console.log('Evento recibido en QR:', this.evento);
  }
}
