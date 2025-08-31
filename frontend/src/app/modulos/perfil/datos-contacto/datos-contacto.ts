import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-datos-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datos-contacto.html'
})
export class DatosContacto implements OnChanges {
  @Input() modoEdicion: boolean = false;
  @Input() ciudades: any[] = [];
  @Input() departamentos: any[]=[];
  @Input() datosUsuario: any;
  @Input() mostrarError: boolean = false;
  @Output() datosCambiados = new EventEmitter<any>();

  email: string = '';
  direccion: string = 'N/A';
  ciudad: number | null = null;
  telefono: string = 'N/A';


  // Método que puedes llamar desde el padre (perfil.ts)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosUsuario'] && this.datosUsuario) {
      this.sincronizarDatos();
    }
  }

  private sincronizarDatos(): void {
    this.email = this.datosUsuario.EMAIL || '';
    this.direccion = this.datosUsuario.DIRECCION || '';
    this.ciudad = this.datosUsuario.ID_CIUDAD || null;
    this.telefono = this.datosUsuario.TELEFONO || '';
  }


  onCampoCambiado(): void {
    this.datosCambiados.emit({
      EMAIL: this.email,
      DIRECCION: this.direccion,
      TELEFONO: this.telefono,
      ID_CIUDAD: this.ciudad
    });
  }

  getNombreCiudad(id: number | null): string {
    if (id === null) return '';
    const ciudad = this.ciudades.find(c => c.ID_CIUDAD === id);
    return ciudad ? ciudad.NOMBRE : '';
  }

}


