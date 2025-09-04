import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HistorialProgreso } from './historial-progreso/historial-progreso';
import { SubirFotografia } from './subir-fotografia/subir-fotografia';
import { ComparacionFotografica } from './comparacion-fotografica/comparacion-fotografica';

@Component({
  selector: 'app-fotografias',
  standalone: true,
  imports: [
    CommonModule
    , HistorialProgreso
    , SubirFotografia
    , ComparacionFotografica
  ],
  templateUrl: './fotografias.html'
})
export class Fotografias {
componenteActivo: 'subir' | 'historial' | 'comparacion' | null = null;

  mostrarComponente(tipo: 'subir' | 'historial' | 'comparacion') {
    this.componenteActivo = tipo;
  }

  volverBotones() {
    this.componenteActivo = null;
  }
}
