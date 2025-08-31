import { Component, EventEmitter,Output } from '@angular/core';
import { Router } from '@angular/router';
//Habilita la navegacion entre rutas o path 
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  // Aca se define como se nombrara el template de app.ts
  selector: 'app-sidebar',
  // Declara independencia de otros componentes
  standalone: true,
  // Importa las clases a usar dentro del componente
  imports: [CommonModule, RouterModule],
  // aca se indica donde esta guardado el html del sidebar que esta en la misma carpeta de este typescript
  templateUrl: './sidebar.html'
})
export class Sidebar {

   @Output() sidebarToggled = new EventEmitter<void>();

  constructor(public router: Router){}
  
  // Aca se crea la funcion de dirigir la ruta al inicio
  cerrarSesion() {
    this.router.navigate(['/']);
  }

   toggleSidebar() {
    this.sidebarToggled.emit();
  }
}
