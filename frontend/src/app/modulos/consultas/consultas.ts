import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConsultasAdministrativo } from "./consultas-administrativo/consultas-administrativo";
import { ConsultasAntropometricos } from "./consultas-antropometricos/consultas-antropometricos";
import { ConsultasAsistencia } from "./consultas-asistencia/consultas-asistencia";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, ConsultasAdministrativo, ConsultasAntropometricos, ConsultasAsistencia,   CommonModule,FormsModule],
  templateUrl: './consultas.html'
})
export class Consultas {

  tipoSeleccionado:string= '';
  fechaInicio:string='';
  fechaFin:string='';

}
