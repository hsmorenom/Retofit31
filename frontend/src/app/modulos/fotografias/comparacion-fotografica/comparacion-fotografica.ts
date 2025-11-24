import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente';
import { FotografiaService } from '../../../services/fotografia';

@Component({
  selector: 'app-comparacion-fotografica',
  standalone: true,
  templateUrl: './comparacion-fotografica.html',
  imports: [CommonModule, FormsModule]
})
export class ComparacionFotografica {

  baseFotosUrl = "http://localhost:8000/";

  terminoBusqueda = "";
  cliente: any = null;
  idCliente = 0;

  tipoPerfil = ""; // frontal | lateral | posterior
  fechas: string[] = [];
  fechaUno = "";
  fechaDos = "";

  fotoUno: string | null = null;
  fotoDos: string | null = null;

  sliderValue = 50;

  constructor(
    private clienteService: ClienteService,
    private fotografiaService: FotografiaService
  ) {}

  // Buscar cliente por documento
  buscarCliente() {
    if (!this.terminoBusqueda.trim()) return;

    this.clienteService.buscarPorDocumento(this.terminoBusqueda).subscribe({
      next: (res) => {
        this.cliente = Array.isArray(res) ? res[0] : res?.data ? res.data[0] : res;
        if (!this.cliente) return alert("❌ Cliente no encontrado");

        this.idCliente = this.cliente.ID_CLIENTE;

        // cargar fechas de fotografías del cliente
        this.fotografiaService.obtenerFechasPorCliente(this.idCliente).subscribe({
          next: (resp) => this.fechas = resp
        });
      }
    });
  }

  // Cargar la imagen correspondiente según perfil + fecha
  cargarFoto(fecha: string, destino: "uno" | "dos") {
    if (!fecha || !this.tipoPerfil) return;

    this.fotografiaService.obtenerFotosPorFecha(this.idCliente, fecha).subscribe({
      next: (res) => {
        if (!res) return;

        let url = null;

        if (this.tipoPerfil === "Frontal") url = res.URL_FOTO_FRONTAL;
        if (this.tipoPerfil === "Lateral") url = res.URL_FOTO_LATERAL;
        if (this.tipoPerfil === "Posterior") url = res.URL_FOTO_POSTERIOR;

        if (destino === "uno") this.fotoUno = this.baseFotosUrl + url;
        if (destino === "dos") this.fotoDos = this.baseFotosUrl + url;
      }
    });
  }

  seleccionarFechaUno() {
    this.cargarFoto(this.fechaUno, "uno");

    // limpiar segunda fecha
    this.fechaDos = "";
    this.fotoDos = null;
  }

seleccionarFechaDos() {
  if (!this.fechaUno) {
    return alert("⚠️ Primero seleccione la fecha UNO");
  }

  // NUEVA CONDICIÓN (fechaUno no puede ser mayor)
  if (this.fechaUno > this.fechaDos) {
    alert("⚠️ La Fecha UNO no puede ser mayor que la Fecha DOS");
    this.fechaDos = "";
    return;
  }

  this.cargarFoto(this.fechaDos, "dos");
}

consultarComparacion() {
  // VALIDACIONES
  if (!this.cliente) {
    return alert("⚠️ Primero busque un cliente.");
  }

  if (!this.tipoPerfil) {
    return alert("⚠️ Seleccione un tipo de perfil.");
  }

  if (!this.fechaUno) {
    return alert("⚠️ Seleccione la Fecha UNO.");
  }

  if (!this.fechaDos) {
    return alert("⚠️ Seleccione la Fecha DOS.");
  }

  // Validar que Fecha 1 no sea mayor que Fecha 2
  if (this.fechaUno > this.fechaDos) {
    return alert("⚠️ La Fecha UNO no puede ser mayor que la Fecha DOS.");
  }

  // CARGAR LAS DOS FOTOS
  this.cargarFoto(this.fechaUno, "uno");
  this.cargarFoto(this.fechaDos, "dos");

  // Reset slider
  this.sliderValue = 50;
}

cancelarAccion() {
  this.resetFormulario();
  alert("❌ Acción cancelada.");
}

  resetFormulario() {
    this.terminoBusqueda = "";
    this.cliente = null;
    this.idCliente = 0;

    this.tipoPerfil = "";
    this.fechas = [];

    this.fechaUno = "";
    this.fechaDos = "";

    this.fotoUno = null;
    this.fotoDos = null;

    this.sliderValue = 50;
  }



}
