// EventEmitter envia eventos al componente padre(desde header que es el hijo al padre que es el app)
// el output expone el evento al padre, este se usa junto al EventEmitter
// El input recibe un evento desde el componente padre
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html'
})
export class Header {
  // Aca se recibe la información de app.js que es el padre, segun su resultado booleano si es false, no se hace nada, si es true se inyecta a header
  @Input() mostrarBoton = true;
  // Aca se envia la informacion del click que se hizo en el boton para alternar el boolean en app.ts que es el padre
  @Output() toggle = new EventEmitter<void>();
  // Aca se cumple la funcion de emitir al padre
  emitirToggle() {
    this.toggle.emit();
  }

  // Para funcionalidad de boton hamburguesa de menú responsive o sea segun el tamaño de pantalla
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
