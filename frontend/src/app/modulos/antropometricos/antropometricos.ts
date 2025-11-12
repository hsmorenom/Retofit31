import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RegistroDatosAntropometricos } from "./registro-datos-antropometricos/registro-datos-antropometricos";
import { EvolucionAntropometrica } from "./evolucion-antropometrica/evolucion-antropometrica";
import { ComparacionDatos } from "./comparacion-datos/comparacion-datos";
import { HistorialAntropometricos } from './historial-antropometricos/historial-antropometricos';



@Component({
  selector: 'app-antropometricos',
  standalone: true,
  imports: [CommonModule, RegistroDatosAntropometricos, EvolucionAntropometrica, ComparacionDatos, HistorialAntropometricos],
  templateUrl: './antropometricos.html'
})
export class Antropometricos {
  mostrarEvolucion = false;

  onMostrarEvolucion(valor: boolean) {
    this.mostrarEvolucion = valor;
  }

  onVolverEvolucion() {
  this.mostrarEvolucion = false;
}




}
