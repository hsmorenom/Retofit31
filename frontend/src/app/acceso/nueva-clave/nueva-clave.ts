import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-nueva-clave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-clave.html'
})
export class NuevaClave {

  mostrarClave = false;
  mostrarRepetirClave = false;
  mostrarError = false;
  clave: string = '';
  repetirClave: string = '';
  token: string | null = null;
  emailUsuario: string = '';
  idUsuario: number = 0;



  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get("token");


    if (this.token) {
      this.usuarioService.verificarToken(this.token).subscribe(res => {
        if (res.resultado === 'OK') {
          this.emailUsuario = res.email;
          this.idUsuario = res.idUsuario;
        } else {
          alert(res.mensaje);
          this.router.navigate(['/']);
        }
      });
    }
  }

  iniciarSesion() {
    this.router.navigate(['/'])
  }


  actualizarClave() {

  this.mostrarError = false;

  if (!this.clave || !this.repetirClave) {
    this.mostrarError = true;
    return;
  }

  if (this.clave !== this.repetirClave) {
    alert('Las contraseñas no coinciden');
    this.mostrarError = true;
    return;
  }

  if (!this.token || !this.idUsuario) {
    alert("El enlace no es válido o expiró.");
    this.router.navigate(['/']);
    return;
  }

  this.usuarioService.actualizarClaveDesdeToken(this.token, this.clave)
    .subscribe(res => {
      if (res.resultado === 'OK') {
        alert('La contraseña ha sido actualizada correctamente.');
        this.router.navigate(['/']);
      } else {
        alert(res.mensaje || 'Error al actualizar la contraseña.');
      }
    });
}



}
