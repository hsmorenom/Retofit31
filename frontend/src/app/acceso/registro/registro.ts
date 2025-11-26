import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente';
import { CiudadService } from '../../services/ciudad';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.html',
  imports: [CommonModule, FormsModule, RouterModule]
})
export class Registro {
  // Modelo de datos del formulario
  usuario = {
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    tipoDocumento: 'CC',
    Identificacion: '',
    ciudad: '',
    correo: '',
    clave: '',
    confirmarClave: '',
    fechaNacimiento: ''
  };

  mostrarClave = false;
  mostrarConfirmarClave = false;
  mostrarError = false;

  ciudades: any[] = []; // ✅ Arreglo para almacenar las ciudades desde la DB

  constructor(
    private router: Router,
    private clienteService: ClienteService,
    private ciudadService: CiudadService
  ) { }

  ngOnInit() {
    this.cargarCiudades(); // ✅ Cargar ciudades al iniciar el componente
  }

  cargarCiudades() {
    this.ciudadService.consultar().subscribe({
      next: (data: any) => {
        this.ciudades = data;
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
      }
    });
  }

  registrar() {
    // Validación simple (puedes extenderlo)
    if (this.usuario.clave !== this.usuario.confirmarClave) {
      alert('Las contraseñas no coinciden');
      this.mostrarError = true;
      return;
    }

    // Verificar completado de campos
    if (!this.usuario.primerNombre || !this.usuario.primerApellido || !this.usuario.correo || !this.usuario.clave || !this.usuario.confirmarClave) {
      alert('Por favor llena los campos obligatorios')
      this.mostrarError = true;
      return
    }
    // Verificar completado de campos
    if (!this.usuario.tipoDocumento || !this.usuario.Identificacion || !this.usuario.ciudad || !this.usuario.fechaNacimiento) {
      alert('Por favor llena los campos obligatorios')
      this.mostrarError = true;
      return
    }


    // Construcción de objetos separados
    const usuarioData = {
      PRIMER_NOMBRE: this.usuario.primerNombre,
      SEGUNDO_NOMBRE: this.usuario.segundoNombre,
      PRIMER_APELLIDO: this.usuario.primerApellido,
      SEGUNDO_APELLIDO: this.usuario.segundoApellido,
      EMAIL: this.usuario.correo,
      CLAVE: this.usuario.clave
    };

    const clienteData = {
      TIPO_DOCUMENTO: this.usuario.tipoDocumento,
      IDENTIFICACION: this.usuario.Identificacion,
      CIUDAD: this.usuario.ciudad,
      FECHA_NACIMIENTO: this.usuario.fechaNacimiento
    };

    // Llamar al servicio
    this.clienteService.insertarClienteConUsuario(usuarioData, clienteData).subscribe({
      next: (res) => {
        alert('Usuario registrado con éxito');
        this.router.navigate(['/']); // 👈 redirige al login
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        alert('Hubo un problema al registrar el usuario');
      }
    });

  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }
}
