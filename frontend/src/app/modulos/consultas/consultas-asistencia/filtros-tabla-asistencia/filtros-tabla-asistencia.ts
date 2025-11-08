import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-tabla-asistencia',
  standalone: true,
  imports: [FormsModule,CommonModule ],
  templateUrl: './filtros-tabla-asistencia.html'
})
export class FiltrosTablaAsistencia {

  filtroIdentificacion = '';
  filtroInforme:string = '';
  fechaInicio:string = '';
  fechaFin:string = '';

  eventosDisponibles: any[] = [];
  asistenciasFiltradas: any[] = [];

  consultarAsistencias() { /* llamada al servicio */ }
  limpiarFiltros() { /* reinicia filtros y resultados */ }
  exportarPDF() { /* genera PDF con jspdf + autotable */ }

}
