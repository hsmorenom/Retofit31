import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AsistenciaService } from '../../../../services/asistencia';


Chart.register(...registerables);


@Component({
  selector: 'app-graficos-asistencia',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './graficos-asistencia.html'
})
export class GraficosAsistencia {

  constructor(
    private asistenciaService: AsistenciaService,
  ) { }

}
