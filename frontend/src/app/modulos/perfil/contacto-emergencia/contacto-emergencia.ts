import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto-emergencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto-emergencia.html'
})
export class ContactoEmergencia implements OnChanges {
  @Input() modoEdicion: boolean = false;
  @Input() datosUsuario: any;
  @Input() mostrarError: boolean = false;
  @Output() datosActualizados = new EventEmitter<any>();
  @Output() datosCambiados = new EventEmitter<any>();


  contactoEmergencia = '';
  telefonoEmergencia = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosUsuario'] && this.datosUsuario) {
      this.sincronizarDatos();
    }
  }

  private sincronizarDatos(): void {
    this.contactoEmergencia = this.datosUsuario.CONTACTO_EMERGENCIA || '';
    this.telefonoEmergencia = this.datosUsuario.TELEFONO_EMERGENCIA || '';
  }

  onCampoCambiado() {
    this.datosCambiados.emit({
      CONTACTO_EMERGENCIA: this.contactoEmergencia,
      TELEFONO_EMERGENCIA: this.telefonoEmergencia
    });
  }

}
