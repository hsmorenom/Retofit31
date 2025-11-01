import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RegistroDatosAntropometricos } from "./registro-datos-antropometricos/registro-datos-antropometricos";
import { EvolucionAntropometrica } from "./evolucion-antropometrica/evolucion-antropometrica";
import { ComparacionDatos } from "./comparacion-datos/comparacion-datos";


@Component({
  selector: 'app-antropometricos',
  standalone: true,
  imports: [CommonModule, RegistroDatosAntropometricos, EvolucionAntropometrica, ComparacionDatos],
  templateUrl: './antropometricos.html'
})
export class Antropometricos {

}
