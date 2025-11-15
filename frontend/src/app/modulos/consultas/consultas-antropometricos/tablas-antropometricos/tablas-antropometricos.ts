import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tablas-antropometricos',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tablas-antropometricos.html'
})
export class TablasAntropometricos {
    @Input() resultados: any[] = [];
}
