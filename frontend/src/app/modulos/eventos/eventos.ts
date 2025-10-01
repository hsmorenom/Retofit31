import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EditarEvento } from "./editar-evento/editar-evento";
import { AgregarEvento } from "./agregar-evento/agregar-evento";

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, EditarEvento, AgregarEvento],
  templateUrl: './eventos.html'
})
export class Eventos implements OnInit{

  eventosFiltrados: [] = [];
  filtroTexto: string = '';

  ngOnInit(): void {
    
  }

}
