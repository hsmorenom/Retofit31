import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../services/cliente';
import { FotografiaService } from '../../../services/fotografia';

type TipoFoto = 'frontal' | 'posterior' | 'lateral';

interface FotoData {
  archivo: File | null;
  descripcion: string;
  etiqueta: string;
  preview: string | null;
}

@Component({
  selector: 'app-subir-fotografia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subir-fotografia.html',
})
export class SubirFotografia {

  @Output() volver = new EventEmitter<void>();

  terminoBusqueda: string = '';
  resultados: any[] = [];
  clienteSeleccionado: any = null;
  idCliente: number = 0;
  identificacionCliente!: string;


  formFotos: Record<TipoFoto, FotoData> = {
    frontal: { archivo: null, descripcion: '', etiqueta: '', preview: null },
    posterior: { archivo: null, descripcion: '', etiqueta: '', preview: null },
    lateral: { archivo: null, descripcion: '', etiqueta: '', preview: null }
  };

  constructor(
    private clienteService: ClienteService,
    private fotografiaService: FotografiaService
  ) {}

  buscarCliente() {
    if (this.terminoBusqueda.trim() === '') {
      this.resultados = [];
      this.clienteSeleccionado = null;
      return;
    }

    this.clienteService.buscarPorDocumento(this.terminoBusqueda)
      .subscribe(res => {
        this.resultados = Array.isArray(res) ? res : [res];
      });
  }

  seleccionarCliente(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.idCliente = cliente.ID_CLIENTE;
    this.resultados = [];
    this.identificacionCliente = cliente.identificacion;
  }

  // ✅ Mostrar vista previa al seleccionar una foto
  onFileSelected(event: any, tipo: TipoFoto) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.formFotos[tipo].archivo = archivo;
      const reader = new FileReader();
      reader.onload = () => this.formFotos[tipo].preview = reader.result as string;
      reader.readAsDataURL(archivo);
    }
  }

  eliminarFoto(tipo: TipoFoto) {
    this.formFotos[tipo] = { archivo: null, descripcion: '', etiqueta: '', preview: null };
  }

subirFotos() {
  if (!this.clienteSeleccionado) {
    alert('⚠️ Debes seleccionar primero un cliente.');
    return;
  }

  const fecha = new Date();
  const fechaMysql = fecha.toISOString().slice(0, 19).replace('T', ' ');

  const formData = new FormData();
  formData.append('cliente', String(this.idCliente)); // ID interno
  formData.append('identificacion', this.clienteSeleccionado.IDENTIFICACION); // ✅ Identificación real
  formData.append('usuario', '1'); // Temporal
  formData.append('fecha_inicio', fechaMysql);
  formData.append('fecha_final', fechaMysql);

  if (this.formFotos.frontal.archivo) {
    formData.append('foto_frontal', this.formFotos.frontal.archivo);
    formData.append('desc_frontal', this.formFotos.frontal.descripcion);
    formData.append('etiqueta_frontal', this.formFotos.frontal.etiqueta);
  }

  if (this.formFotos.lateral.archivo) {
    formData.append('foto_lateral', this.formFotos.lateral.archivo);
    formData.append('desc_lateral', this.formFotos.lateral.descripcion);
    formData.append('etiqueta_lateral', this.formFotos.lateral.etiqueta);
  }

  if (this.formFotos.posterior.archivo) {
    formData.append('foto_posterior', this.formFotos.posterior.archivo);
    formData.append('desc_posterior', this.formFotos.posterior.descripcion);
    formData.append('etiqueta_posterior', this.formFotos.posterior.etiqueta);
  }

  this.fotografiaService.insertar(formData).subscribe(
    res => {
      console.log(res);
      alert('✅ Fotos registradas correctamente');
      // ------------------- RESET FORMULARIO -------------------
      this.clienteSeleccionado = null;     // Limpiar cliente
      this.idCliente = 0;                  // Reset ID
      this.terminoBusqueda = '';           // Limpiar input de búsqueda
      this.resultados = [];                // Limpiar resultados de búsqueda

      // Limpiar fotos
      this.formFotos = {
        frontal: { archivo: null, descripcion: '', etiqueta: '', preview: null },
        lateral: { archivo: null, descripcion: '', etiqueta: '', preview: null },
        posterior: { archivo: null, descripcion: '', etiqueta: '', preview: null }
      };
    },
    err => {
      console.error(err);
      alert('❌ Error al registrar las fotos');
    }
  );
}



  onVolver() {
    this.volver.emit();
  }
}
