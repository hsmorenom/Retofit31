import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CapturaAsistencia } from './captura-asistencia/captura-asistencia';
import { ProgramarRecordatorios } from './programar-recordatorios/programar-recordatorios';
import { HistorialAsistencia } from './historial-asistencia/historial-asistencia';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, CapturaAsistencia, ProgramarRecordatorios,HistorialAsistencia],
  templateUrl: './asistencia.html'
})
export class Asistencia {
  mostrarError=false;
  datosAsistencia:any;

}
