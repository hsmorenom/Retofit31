import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario';

@Component({
  selector: 'app-cambiar-clave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-clave.html'
})
export class CambiarClave {
  claveActual = '';
  nuevaClave = '';
  confirmarClave = '';

  mostrarClaveActual = false;
  mostrarNuevaClave = false;
  mostrarConfirmarClave = false;
  mostrarError = false;

  constructor(private usuarioService: UsuarioService) { }

  actualizarclave() {
    if (this.nuevaClave !== this.confirmarClave) {
      alert('⚠️ Las contraseñas nuevas no coinciden');
      return;
    }

    if (!this.nuevaClave || !this.claveActual || !this.confirmarClave) {
      alert('Por favor llena los campos obligatorios')
      this.mostrarError = true;
      return
    }

    const idUsuarioStr = localStorage.getItem('idUsuario');
    if (!idUsuarioStr) {
      alert('⚠️ No se encontró el usuario logueado');
      return;
    }

    const idUsuario = Number(idUsuarioStr);

    // Paso 1: validar la clave actual
    this.usuarioService.validarClave(idUsuario, this.claveActual).subscribe({
      next: (validacion) => {
        if (validacion.resultado === 'OK') {
          // Paso 2: cambiar la clave
          this.usuarioService.cambiarClave(idUsuario, this.claveActual, this.nuevaClave).subscribe({
            next: (res) => {
              console.log('✅ Respuesta backend cambio clave:', res);
              alert('✅ Contraseña actualizada con éxito');
              this.claveActual = '';
              this.nuevaClave = '';
              this.confirmarClave = '';
            },
            error: (err) => {
              console.error('❌ Error al cambiar clave:', err);
              alert('⚠️ No se pudo cambiar la clave. Revisa la consola.');
            }
          });
        } else {
          alert('⚠️ La contraseña actual no es correcta');
        }
      },
      error: (err) => {
        console.error('❌ Error al validar clave:', err);
        alert('⚠️ Error al validar la clave actual');
      }
    });
  }
}
