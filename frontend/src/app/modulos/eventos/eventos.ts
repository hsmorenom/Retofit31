import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditarEvento } from "./editar-evento/editar-evento";
import { AgregarEvento } from "./agregar-evento/agregar-evento";
import { EventosService } from '../../services/eventos';
import { QrEvento } from './qr-evento/qr-evento';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  private filtroSubject: Subject<string> = new Subject();


  mostrarAgregarEvento = false;
  mostrarEditarEvento = false;
  mostrarQrEvento = false;
  eventoSeleccionado: any = null;
  qrEvento: any = null;

  constructor(
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    this.obtenerEventos();
    // Suscribirse al input con debounce
    this.filtroSubject.pipe(
      debounceTime(300), // espera 300ms después de escribir
      distinctUntilChanged()
    ).subscribe(texto => {
      this.eventosService.filtrar(texto).subscribe(res => {
        this.eventosFiltrados = res;
      });
    });
  }

  // Traer datos almacenados de la base de datos a la tabla
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

  filtrarEventos() {
    this.filtroSubject.next(this.filtroTexto);
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
    this.qrEvento = evento;
    this.mostrarQrEvento = true;
  }


  cerrarQrEvento(): void {
    this.mostrarQrEvento = false;
    this.qrEvento = null;
  }



  eliminarEvento(id: number): void {
    const confirmar = confirm('¿Estás seguro de eliminar este evento?');
    if (!confirmar) return;

    this.eventosService.eliminar(id).subscribe({
      next: (resp) => {
        if (resp.resultado === 'OK') {
          alert('Evento eliminado correctamente');
          this.obtenerEventos(); // refresca la lista
        } else {
          alert('Error: ' + resp.mensaje);
        }
      },
      error: (err) => {
        console.error('Error al eliminar', err);
        alert('Ocurrió un error al intentar eliminar el evento');
      }
    });
  }
}
