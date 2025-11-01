import { Component } from '@angular/core';
import { AntropometricosService } from '../../../services/antropometricos';
import { ClienteService } from '../../../services/cliente';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-datos-antropometricos',
  imports: [CommonModule,FormsModule],
  templateUrl: './registro-datos-antropometricos.html'
})
export class RegistroDatosAntropometricos {
  clientesSeleccionados: any[] = [];
   documentoBusqueda: string = '';

   constructor(
       private clienteService: ClienteService,
       private antropometricosService: AntropometricosService
     ) { }

   buscarCliente() {
    if (!this.documentoBusqueda.trim()) return;

    this.clienteService.buscarPorDocumento(this.documentoBusqueda).subscribe({
      next: (res) => {
        const cliente =
          Array.isArray(res) && res.length > 0 
            ? res[0]
            : typeof res === 'object' && Object.keys(res).length > 0
              ? res
              : null;

        if (cliente && cliente.ID_CLIENTE) {
          const existe = this.clientesSeleccionados.some(
            (c) => c.ID_CLIENTE === cliente.ID_CLIENTE
          );

          if (!existe) {
            this.clientesSeleccionados.push(cliente);
          } else {
            alert('⚠️ Este cliente ya está agregado.');
          }
        } else {
          alert('❌ No se encontró ningún cliente con esa identificación.');
        }

        this.documentoBusqueda = '';
      },
      error: (err) => {
        console.error('Error al buscar cliente:', err);
        alert('⚠️ Hubo un problema al realizar la búsqueda.');
      },
    });

  }

  eliminarCliente(id: number) {
    this.clientesSeleccionados = this.clientesSeleccionados.filter(
      (c) => c.ID_CLIENTE !== id
    );
  }

  limpiarFormulario() {
    this.documentoBusqueda = '';
    this.clientesSeleccionados = [];
  }

}
