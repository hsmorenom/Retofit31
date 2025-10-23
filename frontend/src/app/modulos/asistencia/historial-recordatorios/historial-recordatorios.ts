import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecordatorioService } from '../../../services/recordatorio';

@Component({
  selector: 'app-historial-recordatorios',
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-recordatorios.html'
})
export class HistorialRecordatorios implements OnInit {

  recordatorio: any[] = [];
  mostrarVigencia = false;

  recordatoriosVigentes: any[] = [];

  constructor(
    private recordatorioService: RecordatorioService
  ) { }

  ngOnInit(): void {
    this.cargarRecordatorioHistorial();
  }

  cargarRecordatorioHistorial() {
    this.recordatorioService.consultar().subscribe({
      next: (data) => {
        this.recordatorio = data;
        this.recordatoriosVigentes = [...data]; // Copia inicial
      },
      error: (error) => {
        console.error('Error al obtener los eventos:', error);
      }
    });
  }

  cargarVigentes(): void {
    this.recordatorioService.consultarVigentes().subscribe({
      next: (res) => (this.recordatorio = res),
      error: (err) => console.error('Error al cargar recordatorios vigentes:', err)
    });
  }

  toggleVista(): void {
    this.mostrarVigencia = !this.mostrarVigencia;
    if (this.mostrarVigencia) {
      this.cargarVigentes();
    } else {
      this.cargarRecordatorioHistorial();
    }
  }

  enviarRecordatorio() {

  }

  eliminarRecordatorio(id: number): void {
    if (confirm('¿Estás seguro de eliminar este registro de asistencia?')) {
      this.recordatorioService.eliminar(id).subscribe({
        next: (res) => {
          alert('Asistencia eliminada correctamente.');
          this.recordatorio = this.recordatorio.filter(a => a.ID_ASISTENCIA !== id);
           this.cargarRecordatorioHistorial()
        },
        error: (err) => {
          console.error('Error al eliminar asistencia:', err);
          alert('Hubo un error al eliminar la asistencia.');
        }
      });
    }
  }
  

}
