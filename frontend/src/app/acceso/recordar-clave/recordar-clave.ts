import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-recordar-clave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recordar-clave.html'
})
export class RecordarClave {

  email: string = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) { }

  enviarEnlace() {

    if (!this.email || this.email.trim() === '') {
      alert("Por favor ingresa el correo electrónico.");
      return;
    }

    // Validación simple de email
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronEmail.test(this.email)) {
      alert("Ingresa un correo electrónico válido.");
      return;
    }

    this.usuarioService.enviarCorreoRecuperacion(this.email)
      .subscribe(res => {

        if (res.resultado === 'OK') {
          alert("Te hemos enviado un correo con el enlace de recuperación.");

          // Guardar el email temporalmente (opcional)
          localStorage.setItem("emailRecuperacion", this.email);

          // Redirigir a login (opcional)
          // this.router.navigate(['/']);
        }

        else {
          alert(res.mensaje || "No se pudo enviar el enlace.");
        }

      }, err => {
        alert("Error al conectar con el servidor.");
      });
  }


  iniciarSesion() {
    this.router.navigate(['/'])
  }
}
