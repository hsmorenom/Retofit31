// Component importa el decorador que define lo que es un componente es decir trale los componentes a la plantilla global 
import { Component } from '@angular/core';
// Router promueve la navegación por codigo, routerOutlet actua como un contenedor y de alli se muestran las vistas de app.routes
import { Router, RouterOutlet } from '@angular/router';
// CommonModule importa funcionalidades elementales en angular como *ngIf o *ngFor
import { CommonModule } from '@angular/common';
// Importa los componentes creados y que van a estar de forma predeterminada en todas las paginas
import { Header } from './estructura/header/header';
import { Footer } from "./estructura/footer/footer";
import { Sidebar } from './estructura/sidebar/sidebar';


// @Component define este archivo como un componente
@Component({
  // Este componente se llama por esta etiqueta en el html
  selector: 'app-root',
  // standalone hace que el componente no se comporte de forma tradicional y que este se comporte de forma independiente
  standalone: true,
  // Aca se llaman los modulos que se importanton antes de la definición de componente
  imports: [CommonModule, RouterOutlet, Header, Footer, Sidebar],
  // Este es el esqueleto en como se va a ver la plantilla global 
  template: `
  <!-- Aca se llama el header y que con un @input llamado mostrar boton y que se activa cuando la ruta no sea al del inicio que esta definido en app..routes.ts como'/' -->
   <!-- toggle es un evento escuchado por el header y le dice si se hizo clic o no en el boton de hamburguesa y de acuerdo a ello se llama la funcion de tooglesidebar -->
    <div class="flex flex-col min-h-screen">
      <app-header [mostrarBoton]="router.url !== '/' && router.url !=='/registro' && router.url !=='/recordar-clave'" (toggle)="toggleSidebar()"></app-header>
      <!-- Aca se llama el style de flexbox con flex lo cual hace que el contenidop sea en fila, el sidebar y el router-oultet  -->
      <div class="flex flex-1">
        <!-- *ngIf es un es una funcion de CommonModule cuyo proposito es ocultar o mostrar segun la condicion, en este caso mostrarSidebar se declaro en false( ver clase APP aqui abajo) y cambia segun la funcion de tooglesidebar, y se debe cumplir la condicion si o si que el router.url que se llame sea diferente a '/' que es inicio, si se cumple esto, el sidebar se mostrara, de lo contrario se ocultará, el mostrar Sidebar se modifica si toggleSidebar modifica su condicion de true a false-->
          <app-sidebar *ngIf="mostrarSidebar && router.url !== '/' && router.url !=='/registro' && router.url !=='/recordar-clave' "></app-sidebar>
          <!-- Aca se crea un div para que el espacio restante del sidebar sea ocupada para el routerOutlet el flex-1 garantiza esto -->
          <main class="flex-1 overflow-auto">
            <router-outlet></router-outlet>
          </main>
      </div>
      <!-- Aca se llama lo que se armo en html del footer -->
      <app-footer ></app-footer>
  </div>
  `
})
// Aca se modifica la funcionalidad del componente con la clase del mismo nombre
export class App {
  // Aca se declara el mostrarSidebar como true o false y se utiliza para controlar la visibilidad en el template
  mostrarSidebar = false;
  // Aca se inyecta el contructor para que el componente lea las rutas creadas como es el caso de router.url y es por ello que aca se reconocer '/' como la ruta de inicio

  constructor(public router: Router) { }
  // Funcion creada para que mostrarSidebar cambie de declaracion: ejm. aca mostrarsidebar esta en false, al ejecutar esta funcion la vuelve true, y lo ejecuta al escuchar el toggle de header al hacer click
  toggleSidebar() {
    this.mostrarSidebar = !this.mostrarSidebar;
  }
}
