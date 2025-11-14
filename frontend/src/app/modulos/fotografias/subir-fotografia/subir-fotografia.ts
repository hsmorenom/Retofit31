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
      this.resetFormulario(); // limpia todo si borra la barra
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

        // 🔎 Buscar si ya tiene fotos registradas HOY
        this.cargarFotosDeHoy();
      },

      error: () => alert('⚠️ Hubo un problema al realizar la búsqueda.')
    });
  }

  // ============================
  // CARGAR FOTOS DE HOY (SI EXISTEN)
  // ============================
  cargarFotosDeHoy() {
    const hoy = new Date().toISOString().slice(0, 10);

    this.fotografiaService.filtrar(this.idCliente).subscribe(
      (fotos: any[]) => {

        if (!fotos || fotos.length === 0) {
          // No tiene fotos → formulario limpio pero cliente queda cargado
          this.resetSoloFotos();
          return;
        }

        // Buscar si tiene registro HOY
        const fotoHoy = fotos.find(f => f.FECHA__REGISTRO === hoy);

        if (!fotoHoy) {
          // Tiene fotos, pero no de hoy → formulario limpio (para subir nuevas)
          this.resetSoloFotos();
          return;
        }

        // ==========================
        // Tiene fotos HOY → modo edición
        // ==========================
        this.idEdicion = fotoHoy.ID_FOTOGRAFIA;
        this.fechaRegistro = fotoHoy.FECHA__REGISTRO;

        this.formFotos.frontal.descripcion = fotoHoy.DESC_FRONTAL || '';
        this.formFotos.frontal.etiqueta    = fotoHoy.ETIQUETA_FRONTAL || '';

        this.formFotos.lateral.descripcion = fotoHoy.DESC_LATERAL || '';
        this.formFotos.lateral.etiqueta    = fotoHoy.ETIQUETA_LATERAL || '';

        this.formFotos.posterior.descripcion = fotoHoy.DESC_POSTERIOR || '';
        this.formFotos.posterior.etiqueta    = fotoHoy.ETIQUETA_POSTERIOR || '';

        // Vista previa de las fotos almacenadas en el servidor
        this.formFotos.frontal.preview =
          this.baseFotosUrl + fotoHoy.URL_FOTO_FRONTAL;

        this.formFotos.lateral.preview =
          this.baseFotosUrl + fotoHoy.URL_FOTO_LATERAL;

        this.formFotos.posterior.preview =
          this.baseFotosUrl + fotoHoy.URL_FOTO_POSTERIOR;
      },

      (error) => console.error('Error al cargar fotos del cliente:', error)
    );
  }

  // ============================
  // SELECCIONAR ARCHIVO
  // ============================
  onFileSelected(event: any, tipo: TipoFoto) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.formFotos[tipo].archivo = archivo;

      const reader = new FileReader();
      reader.onload = () => (this.formFotos[tipo].preview = reader.result as string);
      reader.readAsDataURL(archivo);
    }
  }

  // ============================
  // ELIMINAR FOTO
  // ============================
  eliminarFoto(tipo: TipoFoto) {
    this.formFotos[tipo] = {
      archivo: null,
      descripcion: '',
      etiqueta: '',
      preview: null,
    };
  }

  // ============================
  // EDITAR FOTO EXISTENTE
  // (este lo puedes usar si lanzas edición desde una tabla)
  // ============================
  cargarFotografiaParaEditar(foto: any) {
    this.idEdicion = foto.ID_FOTOGRAFIA;
    this.fechaRegistro = foto.FECHA__REGISTRO;

    this.formFotos.frontal.descripcion = foto.DESC_FRONTAL || '';
    this.formFotos.frontal.etiqueta    = foto.ETIQUETA_FRONTAL || '';

    this.formFotos.lateral.descripcion = foto.DESC_LATERAL || '';
    this.formFotos.lateral.etiqueta    = foto.ETIQUETA_LATERAL || '';

    this.formFotos.posterior.descripcion = foto.DESC_POSTERIOR || '';
    this.formFotos.posterior.etiqueta    = foto.ETIQUETA_POSTERIOR || '';

    this.formFotos.frontal.preview   = this.baseFotosUrl + foto.URL_FOTO_FRONTAL;
    this.formFotos.lateral.preview   = this.baseFotosUrl + foto.URL_FOTO_LATERAL;
    this.formFotos.posterior.preview = this.baseFotosUrl + foto.URL_FOTO_POSTERIOR;

    alert("🔧 Modo edición activado");
  }

  // ============================
  // EDITAR (solo si es HOY)
  // ============================
  editarFotos() {
    if (!this.idEdicion) {
      alert("⚠️ No hay registro para editar.");
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);

    if (this.fechaRegistro !== hoy) {
      alert("⚠️ Solo puedes editar fotos registradas HOY.");
      return;
    }

    const formData = new FormData();
    formData.append("cliente", this.idCliente.toString());

    if (this.formFotos.frontal.archivo) {
      formData.append("foto_frontal", this.formFotos.frontal.archivo);
    }
    formData.append("desc_frontal", this.formFotos.frontal.descripcion);
    formData.append("etiqueta_frontal", this.formFotos.frontal.etiqueta);

    if (this.formFotos.lateral.archivo) {
      formData.append("foto_lateral", this.formFotos.lateral.archivo);
    }
    formData.append("desc_lateral", this.formFotos.lateral.descripcion);
    formData.append("etiqueta_lateral", this.formFotos.lateral.etiqueta);

    if (this.formFotos.posterior.archivo) {
      formData.append("foto_posterior", this.formFotos.posterior.archivo);
    }
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
      error: () => alert("❌ Error al editar fotografías")
    });
  }

  // ============================
  // SUBIR FOTOS (NUEVO REGISTRO)
  // ============================
  subirFotos() {
    if (!this.clienteSeleccionado) {
      alert("⚠️ Debes seleccionar primero un cliente.");
      return;
    }

    const formData = new FormData();
    formData.append('cliente', this.idCliente.toString());
    formData.append('usuario', '1'); // puedes cambiar por el usuario logueado
    formData.append('identificacion', this.identificacionCliente);

    if (this.formFotos.frontal.archivo) {
      formData.append('foto_frontal', this.formFotos.frontal.archivo);
    }
    formData.append('desc_frontal', this.formFotos.frontal.descripcion);
    formData.append('etiqueta_frontal', this.formFotos.frontal.etiqueta);

    if (this.formFotos.lateral.archivo) {
      formData.append('foto_lateral', this.formFotos.lateral.archivo);
    }
    formData.append('desc_lateral', this.formFotos.lateral.descripcion);
    formData.append('etiqueta_lateral', this.formFotos.lateral.etiqueta);

    if (this.formFotos.posterior.archivo) {
      formData.append('foto_posterior', this.formFotos.posterior.archivo);
    }
    formData.append('desc_posterior', this.formFotos.posterior.descripcion);
    formData.append('etiqueta_posterior', this.formFotos.posterior.etiqueta);

    this.fotografiaService.insertar(formData).subscribe({
      next: (res) => {
        if (res.resultado === 'OK') {
          alert('📸 Fotografías guardadas correctamente.');
          // Full reset: limpia cliente y formulario
          this.resetFormulario();
        } else {
          alert('⚠️ Error: ' + res.mensaje);
        }
      },
      error: () => alert('❌ Error al subir las fotografías.')
    });
  }

  // ============================
  // RESET SOLO FOTOS (mantiene cliente)
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
  // RESET COMPLETO DEL FORMULARIO
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

  cancelarAccion() {
  this.resetFormulario();
  alert("🔄 Acción cancelada.");
}
}
