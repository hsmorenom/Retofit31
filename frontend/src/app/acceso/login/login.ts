import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario';
import { ClienteService } from '../../services/cliente';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class Login {
  usuario: string = '';
  clave: string = '';
  mostrarClave=false;
  mostrarError = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private clienteService: ClienteService
  ) { }

iniciarSesion() {
  if (!this.usuario || !this.clave) {
    alert('Por favor ingresa usuario y clave');
    this.mostrarError = true;
    return;
  }

  this.usuarioService.login({ email: this.usuario, clave: this.clave }).subscribe({
    next: (respuesta) => {

      const usuario = respuesta[0]; // tu API devuelve array

      if (usuario && usuario.ID_USUARIO) {

        // 🔥 GUARDAR LOS DATOS QUE NECESITAS PARA EL DASHBOARD
        localStorage.setItem('idUsuario', usuario.ID_USUARIO.toString());

        // Si existe el cliente asociado
        if (usuario.ID_CLIENTE) {
          localStorage.setItem('id_cliente', usuario.ID_CLIENTE.toString());
        }

        // 🔥 GUARDAR LA IDENTIFICACIÓN (NECESARIA PARA ANTROPOMETRÍA)
        if (usuario.IDENTIFICACION) {
          localStorage.setItem('identificacion', usuario.IDENTIFICACION);
        }

        // 🔥 Puedes guardar el rol si necesitas cargar dashboard según rol
        if (usuario.TIPO_USUARIO) {
          localStorage.setItem('rol', usuario.TIPO_USUARIO.toString());
        }

        // Redirigir al panel
        this.router.navigate(['/inicio']);
      } else {
        console.error("❌ No se encontró usuario válido en la respuesta");
        alert("Usuario no encontrado");
      }

    },
    error: (error) => {
      console.error('Error al iniciar sesión', error);
      alert('Credenciales incorrectas o error en el servidor');
    }
  });
}


  registrarUsuario() {
    this.router.navigate(['/registro']);
  }

  recordarClave() {
    this.router.navigate(['/recordar-clave']);
  }

  toggleError(){
    this.mostrarError=!this.mostrarError;
  }


}
