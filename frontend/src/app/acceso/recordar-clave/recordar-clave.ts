import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recordar-clave',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recordar-clave.html'
})
export class RecordarClave {

  constructor(private router: Router) { }
  iniciarSesion() {
    this.router.navigate(['/'])
  }
}
