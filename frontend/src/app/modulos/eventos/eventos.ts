import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditarEvento } from "./editar-evento/editar-evento";
import { AgregarEvento } from "./agregar-evento/agregar-evento";
import { EventosService } from '../../services/eventos';
import { QrEvento } from './qr-evento/qr-evento';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, EditarEvento, AgregarEvento, QrEvento],
  templateUrl: './eventos.html'
})
export class Eventos implements OnInit {

  eventos: any[] = [];
  eventosFiltrados: any[] = [];
  filtroTexto: string = '';

  mostrarAgregarEvento = false;
  mostrarEditarEvento = false;
  mostrarQrEvento = false;
  eventoSeleccionado: any = null;
  qrEvento: any = null;

  constructor(private eventosService: EventosService) { }

  ngOnInit(): void {
    this.obtenerEventos();
  }

  obtenerEventos(): void {
    this.eventosService.consultar().subscribe({
      next: (data) => {
        this.eventos = data;
        this.eventosFiltrados = [...data]; // Copia inicial
      },
      error: (error) => {
        console.error('Error al obtener los eventos:', error);
      }
    });
  }

  // 🔍 Filtrar eventos por texto
  filtrarEventos(): void {
    const texto = this.filtroTexto.toLowerCase().trim();
    this.eventosFiltrados = this.eventos.filter(evento =>
      evento.nombre?.toLowerCase().includes(texto) ||
      evento.lugar?.toLowerCase().includes(texto) ||
      evento.instructor?.toLowerCase().includes(texto) ||
      evento.fecha?.toLowerCase().includes(texto)
    );
  }

  limpiarFiltro(): void {
    this.filtroTexto = '';
    this.eventosFiltrados = [...this.eventos];
  }

  abrirAgregarEvento(): void {
    this.mostrarAgregarEvento = true;
  }

  cerrarAgregarEvento(): void {
    this.mostrarAgregarEvento = false;
    this.obtenerEventos(); // 🔁 refrescar después de agregar
  }

  abrirEditarEvento(evento: any): void {
    this.eventoSeleccionado = evento;
    this.mostrarEditarEvento = true;
  }

  cerrarEditarEvento(): void {
    this.mostrarEditarEvento = false;
    this.eventoSeleccionado = null;
    this.obtenerEventos(); // 🔁 refrescar después de editar
  }

  abrirQrEvento(evento: any): void {
    console.log('Evento recibido para QR:', evento);
    this.qrEvento = evento;
    this.mostrarQrEvento = true;
  }


  cerrarQrEvento(): void {
    this.mostrarQrEvento = false;
    this.qrEvento = null;
  }



  eliminarEvento(idEvento: number): void {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      this.eventosService.eliminar(idEvento).subscribe({
        next: () => {
          alert('Evento eliminado correctamente.');
          this.obtenerEventos();
        },
        error: (error) => {
          console.error('Error al eliminar evento:', error);
          alert('Hubo un error al eliminar el evento.');
        }
      });
    }
  }
}
