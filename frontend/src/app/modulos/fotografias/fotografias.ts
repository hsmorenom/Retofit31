import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HistorialProgreso } from './historial-progreso/historial-progreso';
import { SubirFotografia } from './subir-fotografia/subir-fotografia';
import { ComparacionFotografica } from './comparacion-fotografica/comparacion-fotografica';

@Component({
  selector: 'app-fotografias',
  standalone: true,
  templateUrl: './fotografias.html',
  imports: [
    CommonModule,
    HistorialProgreso,
    SubirFotografia,
    ComparacionFotografica
  ],
})
export class Fotografias {}
