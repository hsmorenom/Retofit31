import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../../services/asistencia';
import { EventosService } from '../../../../services/eventos';
import { ClienteService } from '../../../../services/cliente';



@Component({
  selector: 'app-filtros-tabla-asistencia',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './filtros-tabla-asistencia.html'
})
export class FiltrosTablaAsistencia implements OnInit {

  filtroIdentificacion = '';
  eventoSeleccionado = '';
  tipoInformeSeleccionado = '';
  fechaInicio = '';
  fechaFin = '';

  eventosDisponibles: any[] = [];
  clientes: any[] = [];
  asistenciasFiltradas: any[] = [];

  constructor(
    private asistenciaService: AsistenciaService,
    private eventosService: EventosService,
    private clienteService: ClienteService
  ) {}

  ngOnInit() {
    this.cargarEventos();
    this.cargarClientes();
  }

  cargarEventos() {
    this.eventosService.consultar().subscribe(res => {
      this.eventosDisponibles = Array.isArray(res) ? res : [];
    });
  }

  cargarClientes() {
    this.clienteService.consultar().subscribe(res => {
      this.clientes = Array.isArray(res) ? res : [];
    });
  }

  consultarAsistencias() {

    if (!this.eventoSeleccionado || !this.tipoInformeSeleccionado) {
      alert("Seleccione un evento y un tipo de informe");
      return;
    }

    this.asistenciaService.resumenEvento(Number(this.eventoSeleccionado))
      .subscribe(res => {

        // 🔹 TOMAR SEGÚN TIPO DE INFORME
        let listaBase: any[] = [];

        if (this.tipoInformeSeleccionado === 'asistencias') {
          listaBase = res.asistencias;
        }

        if (this.tipoInformeSeleccionado === 'inasistencias') {
          listaBase = res.inasistencias;
        }

        if (this.tipoInformeSeleccionado === 'porcentaje') {
          // % necesita programados + asistencias
          listaBase = res.programados;
        }

        // 🔹 FILTRO POR IDENTIFICACIÓN
        if (this.filtroIdentificacion.trim() !== '') {
          listaBase = listaBase.filter(a =>
            a.IDENTIFICACION === this.filtroIdentificacion.trim()
          );
        }

        // 🔹 FILTRO POR FECHAS
        if (this.fechaInicio && this.fechaFin) {
          const inicio = new Date(this.fechaInicio);
          const fin = new Date(this.fechaFin);

          listaBase = listaBase.filter(a => {
            const fecha = new Date(a.FECHA_ACTIVIDAD);
            return fecha >= inicio && fecha <= fin;
          });
        }

        // 🔹 UNIR CON CLIENTE (EDAD + SEXO)
        listaBase = this.unirDatosConCliente(listaBase);

        // 🔹 CALCULAR RESULTADO PARA CADA TIPO
        this.asistenciasFiltradas = this.procesarResultados(listaBase, res);

      });
  }

  unirDatosConCliente(lista: any[]) {
    return lista.map(a => {
      const cliente = this.clientes.find(
        c => String(c.IDENTIFICACION) === String(a.IDENTIFICACION)
      );

      if (cliente) {
        a.EDAD = this.calcularEdad(cliente.FECHA_NACIMIENTO);
        a.SEXO = cliente.SEXO;
      } else {
        a.EDAD = 'N/D';
        a.SEXO = 'N/D';
      }

      return a;
    });
  }

  procesarResultados(lista: any[], resCompleto: any) {

    // --- TIPO ASISTENCIAS ---
    if (this.tipoInformeSeleccionado === 'asistencias') {
      return lista.map(a => ({ ...a, RESULTADO: 1 }));
    }

    // --- TIPO INASISTENCIAS ---
    if (this.tipoInformeSeleccionado === 'inasistencias') {
      return lista.map(a => ({ ...a, RESULTADO: 1 }));
    }

    // --- TIPO PORCENTAJE ---
    if (this.tipoInformeSeleccionado === 'porcentaje') {

      const asistencias = resCompleto.asistencias;

      return lista.map(p => {
        const asistio = asistencias.filter((a:any) =>
          a.ID_CLIENTE === p.ID_CLIENTE
        ).length;

        const total = 1; // porque porcentaje por evento es 1 programado

        return {
          ...p,
          RESULTADO: ((asistio / total) * 100).toFixed(1) + '%'
        };
      });
    }

    return [];
  }

  calcularEdad(fecha: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  limpiarFiltros() {
    this.filtroIdentificacion = '';
    this.eventoSeleccionado = '';
    this.tipoInformeSeleccionado = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.asistenciasFiltradas = [];
  }

  exportarPDF() {
    alert("Exportar PDF pendiente de implementar");
  }

}
