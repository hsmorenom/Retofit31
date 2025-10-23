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

  recordatoriosVigentes: any[] = [];

  constructor(
    private recordatorioService: RecordatorioService
  ) { }

  ngOnInit(): void {
    this.cargarRecordatorioVigentes();
  }

  cargarRecordatorioVigentes() {
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

  enviarRecordatorio(){

  }

  eliminarRecordatorio(){
    
  }

}
