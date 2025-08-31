import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info-basica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './info-basica.html'
})
export class InfoBasica implements OnChanges {
  @Input() modoEdicion: boolean = false;
  @Input() mostrarError: boolean = false;
  @Input() datosUsuario: any;
  @Output() datosCambiados = new EventEmitter<any>(); // Nuevo EventEmitter para cambios

  // Variables locales para los campos editables
  primerNombre = '';
  segundoNombre = '';
  primerApellido = '';
  segundoApellido = '';
  tipoDocumento = '';
  numeroIdentificacion = '';
  sexo = '';
  fechaNacimiento = '';
  fotoPerfil: string = 'assets/images/perfil/imagen-perfil-usuario.png';

  get nombreCompleto(): string {
    return `${this.primerNombre} ${this.segundoNombre} ${this.primerApellido} ${this.segundoApellido}`.toUpperCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosUsuario'] && this.datosUsuario) {
      this.sincronizarDatos();
    }
  }

  private sincronizarDatos(): void {
    this.primerNombre = this.datosUsuario.PRIMER_NOMBRE || '';
    this.segundoNombre = this.datosUsuario.SEGUNDO_NOMBRE || '';
    this.primerApellido = this.datosUsuario.PRIMER_APELLIDO || '';
    this.segundoApellido = this.datosUsuario.SEGUNDO_APELLIDO || '';
    this.tipoDocumento = this.datosUsuario.TIPO_DOCUMENTO || '';
    this.numeroIdentificacion = this.datosUsuario.IDENTIFICACION || '';
    this.sexo = this.datosUsuario.SEXO || 'N/A';
    this.fechaNacimiento = this.datosUsuario.FECHA_NACIMIENTO || '';
    this.fotoPerfil = this.datosUsuario.FOTO_PERFIL_URL || 'assets/images/perfil/imagen-perfil-usuario.png';
  }

  // Emitir cambios cuando se modifica cualquier campo
  onCampoCambiado(): void {
    const cambios = {
      // Campos de usuario
      PRIMER_NOMBRE: this.primerNombre,
      SEGUNDO_NOMBRE: this.segundoNombre,
      PRIMER_APELLIDO: this.primerApellido,
      SEGUNDO_APELLIDO: this.segundoApellido,

      // Campos de cliente
      TIPO_DOCUMENTO: this.tipoDocumento,
      IDENTIFICACION: this.numeroIdentificacion,
      SEXO: this.sexo,
      FECHA_NACIMIENTO: this.fechaNacimiento,
      FOTO_PERFIL_URL: this.fotoPerfil
    };

    this.datosCambiados.emit(cambios);
  }

  http = inject(HttpClient);

  cambiarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append('foto', archivo);
    formData.append('fotoAnterior', this.datosUsuario?.FOTO_PERFIL_URL || '');

    this.http.post<{ url: string }>(
      'http://localhost:8000/backend/api/imagenes/subir-foto-perfil.php',
      formData
    ).subscribe({
      next: (res) => {
        if (!res.url) return;

        const urlConCacheBuster = res.url + '?t=' + Date.now();
        this.fotoPerfil = urlConCacheBuster;
        this.datosUsuario.FOTO_PERFIL_URL = urlConCacheBuster;
        this.onCampoCambiado();

        this.http.post<{ mensaje: string }>(
          'http://localhost:8000/backend/api/imagenes/actualizar-foto.php',
          { id_cliente: this.datosUsuario.ID_CLIENTE, foto_url: res.url }
        ).subscribe();

        // 🔹 Resetear input para permitir volver a seleccionar el mismo archivo
        input.value = '';
      }
    });
  }


}




