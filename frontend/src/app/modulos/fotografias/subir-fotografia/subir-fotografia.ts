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
  archivoNombre?: string; // ← NUEVO
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
  mostrarError=false;

  clienteCargado: boolean = false;

  // ID para edición
  idEdicion: number | null = null;
  fechaRegistro: string | null = null;

  // FORMULARIO DE FOTOS
  formFotos: Record<TipoFoto, FotoData> = {
    frontal:   { archivo: null, descripcion: '', etiqueta: '', preview: null },
    posterior: { archivo: null, descripcion: '', etiqueta: '', preview: null },
    lateral:   { archivo: null, descripcion: '', etiqueta: '', preview: null }
  };

  // URL base donde se sirven las fotos desde PHP
  private baseFotosUrl = 'http://localhost:8000/backend/';

  constructor(
    private clienteService: ClienteService,
    private fotografiaService: FotografiaService
  ) {}

  // ============================
  // BUSCAR CLIENTE
  // ============================
  buscarCliente(disparadoPorBoton: boolean = false) {
    const doc = (this.terminoBusqueda || '').trim();

    if (!doc) {
      this.resetFormulario();
      return;
    }

    this.clienteService.buscarPorDocumento(doc).subscribe({
      next: (res) => {
        let cliente: any = null;

        if (Array.isArray(res)) cliente = res.length ? res[0] : null;
        else if (res?.data) cliente = Array.isArray(res.data) ? res.data[0] : res.data;
        else cliente = res;

        if (!cliente || !cliente.ID_CLIENTE) {
          this.resultados = [];
          if (disparadoPorBoton) {
            alert('❌ No se encontró ningún cliente con esa identificación.');
          }
          return;
        }

        this.resultados = [cliente];
        this.clienteSeleccionado = cliente;
        this.idCliente = cliente.ID_CLIENTE;
        this.identificacionCliente = cliente.IDENTIFICACION;
        this.clienteCargado = true;
        this.terminoBusqueda = '';

        // Ver si tiene fotos HOY
        this.cargarFotosDeHoy();
      },

      error: () => alert('⚠️ Error buscando cliente.')
    });
  }

  // ============================
  // CARGAR FOTOS DE HOY
  // ============================
  cargarFotosDeHoy() {
    const hoy = new Date().toISOString().slice(0, 10);

    this.fotografiaService.filtrar(this.idCliente).subscribe(
      (fotos: any[]) => {

        if (!fotos || fotos.length === 0) {
          this.resetSoloFotos();
          return;
        }

        const fotoHoy = fotos.find(f => f.FECHA__REGISTRO === hoy);

        if (!fotoHoy) {
          this.resetSoloFotos();
          return;
        }

        // ---------------------------
        // MODO EDICIÓN
        // ---------------------------
        this.idEdicion = fotoHoy.ID_FOTOGRAFIA;
        this.fechaRegistro = fotoHoy.FECHA__REGISTRO;

        // TEXTOS
        this.formFotos.frontal.descripcion = fotoHoy.DESC_FRONTAL || '';
        this.formFotos.frontal.etiqueta    = fotoHoy.ETIQUETA_FRONTAL || '';

        this.formFotos.lateral.descripcion = fotoHoy.DESC_LATERAL || '';
        this.formFotos.lateral.etiqueta    = fotoHoy.ETIQUETA_LATERAL || '';

        this.formFotos.posterior.descripcion = fotoHoy.DESC_POSTERIOR || '';
        this.formFotos.posterior.etiqueta    = fotoHoy.ETIQUETA_POSTERIOR || '';

        // PREVIEW
        this.formFotos.frontal.preview   = this.baseFotosUrl + fotoHoy.URL_FOTO_FRONTAL;
        this.formFotos.lateral.preview   = this.baseFotosUrl + fotoHoy.URL_FOTO_LATERAL;
        this.formFotos.posterior.preview = this.baseFotosUrl + fotoHoy.URL_FOTO_POSTERIOR;

        // NOMBRES
        this.formFotos.frontal.archivoNombre   = fotoHoy.URL_FOTO_FRONTAL.split('/').pop();
        this.formFotos.lateral.archivoNombre   = fotoHoy.URL_FOTO_LATERAL.split('/').pop();
        this.formFotos.posterior.archivoNombre = fotoHoy.URL_FOTO_POSTERIOR.split('/').pop();
      },

      (error) => console.error('Error cargando fotos:', error)
    );
  }

  // ============================
  // SELECCIONAR ARCHIVO
  // ============================
  onFileSelected(event: any, tipo: TipoFoto) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.formFotos[tipo].archivo = archivo;
      this.formFotos[tipo].archivoNombre = archivo.name;

      const reader = new FileReader();
      reader.onload = () => (this.formFotos[tipo].preview = reader.result as string);
      reader.readAsDataURL(archivo);
    }
  }

  // ============================
  // ELIMINAR UNA FOTO
  // ============================
  eliminarFoto(tipo: TipoFoto) {
    this.formFotos[tipo] = {
      archivo: null,
      descripcion: '',
      etiqueta: '',
      preview: null,
      archivoNombre: undefined
    };
  }

  // ============================
  // EDITAR FOTOS
  // ============================
  editarFotos() {
    if (!this.idEdicion) return alert("⚠️ No hay registro para editar.");

    const hoy = new Date().toISOString().slice(0, 10);
    if (this.fechaRegistro !== hoy) {
      return alert("⚠️ Solo puedes editar fotos del día actual.");
    }

    const formData = new FormData();
    formData.append("cliente", this.idCliente.toString());

    // Solo enviar archivos si fueron reemplazados
    if (this.formFotos.frontal.archivo)
      formData.append("foto_frontal", this.formFotos.frontal.archivo);
    formData.append("desc_frontal", this.formFotos.frontal.descripcion);
    formData.append("etiqueta_frontal", this.formFotos.frontal.etiqueta);

    if (this.formFotos.lateral.archivo)
      formData.append("foto_lateral", this.formFotos.lateral.archivo);
    formData.append("desc_lateral", this.formFotos.lateral.descripcion);
    formData.append("etiqueta_lateral", this.formFotos.lateral.etiqueta);

    if (this.formFotos.posterior.archivo)
      formData.append("foto_posterior", this.formFotos.posterior.archivo);
    formData.append("desc_posterior", this.formFotos.posterior.descripcion);
    formData.append("etiqueta_posterior", this.formFotos.posterior.etiqueta);

    this.fotografiaService.editar(this.idEdicion, formData).subscribe({
      next: (res) => {
        if (res.resultado === 'OK') {
          alert("✔️ Fotografías actualizadas correctamente.");
          this.resetFormulario();
        } else {
          alert("⚠️ " + res.mensaje);
        }
      },
      error: () => alert("❌ Error al editar fotografías.")
    });
  }

  // ============================
  // SUBIR FOTOS NUEVAS
  // ============================
  subirFotos() {
    if (!this.clienteSeleccionado){
      alert("⚠️ Selecciona un cliente primero.")
      this.mostrarError=true;
      return;
    }

    const formData = new FormData();
    formData.append('cliente', this.idCliente.toString());
    formData.append('usuario', '1');
    formData.append('identificacion', this.identificacionCliente);

    if (this.formFotos.frontal.archivo)
      formData.append('foto_frontal', this.formFotos.frontal.archivo);

    formData.append('desc_frontal', this.formFotos.frontal.descripcion);
    formData.append('etiqueta_frontal', this.formFotos.frontal.etiqueta);

    if (this.formFotos.lateral.archivo)
      formData.append('foto_lateral', this.formFotos.lateral.archivo);

    formData.append('desc_lateral', this.formFotos.lateral.descripcion);
    formData.append('etiqueta_lateral', this.formFotos.lateral.etiqueta);

    if (this.formFotos.posterior.archivo)
      formData.append('foto_posterior', this.formFotos.posterior.archivo);

    formData.append('desc_posterior', this.formFotos.posterior.descripcion);
    formData.append('etiqueta_posterior', this.formFotos.posterior.etiqueta);

    this.fotografiaService.insertar(formData).subscribe({
      next: (res) => {
        if (res.resultado === 'OK') {
          alert("📸 Fotografías guardadas correctamente.");
          this.resetFormulario();
        } else {
          alert("⚠️ Error: " + res.mensaje);
        }
      },
      error: () => alert("❌ Error al subir fotografías.")
    });
  }

  // ============================
  // RESETEAR SOLO FOTOS
  // ============================
  private resetSoloFotos() {
    this.formFotos = {
      frontal:   { archivo: null, descripcion: '', etiqueta: '', preview: null },
      lateral:   { archivo: null, descripcion: '', etiqueta: '', preview: null },
      posterior: { archivo: null, descripcion: '', etiqueta: '', preview: null }
    };

    this.idEdicion = null;
    this.fechaRegistro = null;
  }

  // ============================
  // RESET TOTAL
  // ============================
  resetFormulario() {
    this.resetSoloFotos();

    this.clienteSeleccionado = null;
    this.clienteCargado = false;
    this.idCliente = 0;
    this.identificacionCliente = '';
    this.resultados = [];
    this.terminoBusqueda = '';
  }

  // ===========================
  // CANCELAR
  // ===========================
  cancelarAccion() {
    this.resetFormulario();
    alert("🔄 Acción cancelada.");
  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }

}
