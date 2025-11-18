import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente';
import { FotografiaService } from '../../../services/fotografia';

@Component({
  selector: 'app-historial-progreso',
  standalone: true,
  templateUrl: './historial-progreso.html',
  imports: [
    CommonModule,   // Necesario para *ngIf y *ngFor
    FormsModule     // Necesario para [(ngModel)]
  ],
})
export class HistorialProgreso {

  baseFotosUrl = "http://localhost:8000/backend/";

  terminoBusqueda: string = '';
  clienteSeleccionado: any = null;
  idCliente: number = 0;
  mostrarError = false;

  fechasDisponibles: string[] = [];
  fechaSeleccionada: string = '';

  fotosDeFecha: any = null;

  observacion: string = '';
  idFotografiaSeleccionada: number = 0;

  constructor(
    private clienteService: ClienteService,
    private fotografiaService: FotografiaService
  ) { }

  // ====================================================
  // 1. Buscar cliente
  // ====================================================
  buscarCliente() {
    const doc = this.terminoBusqueda.trim();
    if (!doc) return;

    if (!this.terminoBusqueda){
      alert("⚠️ Digite el numero de identificación primero.")
      this.mostrarError=true;
      return;
    }

    this.clienteService.buscarPorDocumento(doc).subscribe({
      next: (res) => {
        let cliente = null;

        if (Array.isArray(res)) cliente = res[0];
        else if (res?.data) cliente = Array.isArray(res.data) ? res.data[0] : res.data;
        else cliente = res;

        if (!cliente) {
          alert('❌ Cliente no encontrado');
          return;
        }

        this.clienteSeleccionado = cliente;
        this.idCliente = cliente.ID_CLIENTE;

        this.cargarUltimasFechas();
      },
      error: () => alert("⚠️ Error buscando cliente")
    });
  }

  // ====================================================
  // 2. Cargar últimas 10 fechas con fotos
  // ====================================================
  cargarUltimasFechas() {
    this.fotografiaService.obtenerFechasPorCliente(this.idCliente).subscribe({
      next: (res) => {
        this.fechasDisponibles = res || [];
      }
    });
  }

  // ====================================================
  // 3. Cargar fotos de una fecha seleccionada
  // ====================================================
  seleccionarFecha() {
    if (!this.fechaSeleccionada) return;

    this.fotografiaService.obtenerFotosPorFecha(
      this.idCliente,
      this.fechaSeleccionada
    ).subscribe({
      next: (res) => {
        this.fotosDeFecha = res;
        this.idFotografiaSeleccionada = res?.ID_FOTOGRAFIA || 0;
      }
    });
  }

  // ====================================================
  // 4. Guardar observación
  // ====================================================
  guardarObservacion() {
    if (!this.observacion.trim()) {
      alert("⚠️ Debes escribir una observación");
      return;
    }

    const data = {
      idCliente: this.idCliente,
      idFotografia: this.idFotografiaSeleccionada,
      fecha: this.fechaSeleccionada,
      observacion: this.observacion
    };

    this.fotografiaService.guardarObservacion(data).subscribe({
      next: () => {
        alert("✅ Observación guardada correctamente");
        this.resetConsulta();
        this.cargarUltimasFechas(); // Recargar las fechas
      },
      error: () => alert("⚠️ Error guardando la observación")
    });
  }

  // ====================================================
  // 5. CANCELAR CONSULTA (reset parcial)
  // ====================================================
  cancelarConsulta() {
    this.resetConsulta();
  }

  // ====================================================
  // RESET SOLO DE CONSULTA (cliente queda cargado)
  // ====================================================
  private resetConsulta() {
    this.fechaSeleccionada = '';
    this.fechasDisponibles = [];
    this.fotosDeFecha = null;
    this.idFotografiaSeleccionada = 0;
    this.observacion = '';
  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }
}
