import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente';
import { AntropometricosService } from '../../../services/antropometricos';

@Component({
  selector: 'app-comparacion-datos',
  imports: [CommonModule,FormsModule],
  templateUrl: './comparacion-datos.html'
})
export class ComparacionDatos {

  clientesSeleccionados: any[] = [];
    documentoBusqueda: string = '';
    fechaNacimiento: string | null = null;
    edadCalculada: number | null = null;
    sexoSeleccionado: string | null = null; // variable solo cuando el usuario se considera masculino o femenino
    sexoParaCalculo: string | null = null; // variable en caso de que el usuario se considera otro sexo 
  
    constructor(
      private clienteService: ClienteService,
      private antropometricosService: AntropometricosService
    ) { }
  
    buscarCliente() {
    const doc = (this.documentoBusqueda || '').trim();
    if (!doc) return;
  
    this.clienteService.buscarPorDocumento(doc).subscribe({
      next: (res) => {
        // 🔎 Normalizador: soporta varias formas de respuesta
        let cliente: any = null;
  
        if (Array.isArray(res)) {
          cliente = res.length ? res[0] : null;
        } else if (res && typeof res === 'object') {
          // casos comunes: {data:[...]}, {data:{...}}, {cliente:{...}}, {...}
          if (Array.isArray((res as any).data)) cliente = (res as any).data[0] || null;
          else if ((res as any).data && typeof (res as any).data === 'object') cliente = (res as any).data;
          else if ((res as any).cliente && typeof (res as any).cliente === 'object') cliente = (res as any).cliente;
          else cliente = res; // objeto plano
        }
  
        // ✅ Validación mínima
        if (!cliente || !cliente.ID_CLIENTE) {
          console.warn('Respuesta del backend no reconocida:', res);
          alert('❌ No se encontró ningún cliente con esa identificación.');
          return;
        }
  
        // ✅ Solo un cliente seleccionado (reemplaza)
        this.clientesSeleccionados = [cliente];
  
        // ✅ Toma los datos desde la tabla CLIENTE
        this.sexoSeleccionado = cliente.SEXO ?? 'otro';
        this.fechaNacimiento  = cliente.FECHA_NACIMIENTO ?? null;
  
        // ✅ Calcula edad
        this.calcularEdad();
  
        // Si sexo = 'otro', obliga a elegir sexoParaCalculo manual para fórmulas
        this.sexoParaCalculo = (this.sexoSeleccionado === 'otro') ? null : this.sexoSeleccionado;
  
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
        (c) => c.ID_CLIENTE !== id);
        this.limpiarFormulario();
      ;
    }
  
    limpiarFormulario() {
      this.documentoBusqueda = '';
      this.clientesSeleccionados = [];
    }
  
    calcularEdad() {
      if (!this.fechaNacimiento) {
        this.edadCalculada = null;
        return;
      }
  
      const hoy = new Date();
      const nacimiento = new Date(this.fechaNacimiento);
  
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
  
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
  
      this.edadCalculada = edad;
    }

}
