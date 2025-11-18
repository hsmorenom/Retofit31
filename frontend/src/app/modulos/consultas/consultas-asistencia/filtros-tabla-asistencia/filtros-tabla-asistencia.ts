import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../../services/asistencia';
import { EventosService } from '../../../../services/eventos';
import { ClienteService } from '../../../../services/cliente';
import { InformeService } from '../../../../services/informe';





@Component({
  selector: 'app-filtros-tabla-asistencia',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './filtros-tabla-asistencia.html'
})
export class FiltrosTablaAsistencia implements OnInit {

  @Output() datosGraficos = new EventEmitter<any[]>();
  @Output() datosParaInforme = new EventEmitter<any>();
  @Input() graficaBase64: string = '';



  dataGraficos: any[] = [];
  filtroIdentificacion = '';
  eventoSeleccionado = '';
  tipoInformeSeleccionado = '';
  fechaInicio = '';
  fechaFin = '';
  mostrarError = false;



  eventosDisponibles: any[] = [];
  clientes: any[] = [];
  asistenciasFiltradas: any[] = [];

  constructor(
    private asistenciaService: AsistenciaService,
    private eventosService: EventosService,
    private clienteService: ClienteService,
    private informeService: InformeService
  ) { }

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
      this.mostrarError=true;
      return;
    }

    this.asistenciaService.resumenEvento(Number(this.eventoSeleccionado))
      .subscribe(res => {

        const programados = res.programados || [];
        const asistencias = res.asistencias || [];
        const inasistencias = res.inasistencias || [];


        // 🔥 1. Eliminar duplicados por ID_CLIENTE
        const unicos = new Map();
        programados.forEach((p: any) => unicos.set(p.ID_CLIENTE, p));
        const programadosUnicos = Array.from(unicos.values());

        // 🔹 2. BASE REAL: SIEMPRE USAMOS PROGRAMADOS ÚNICOS
        let lista = programadosUnicos.map((p: any) => {
          return {
            ...p,
            ASISTIO: asistencias.filter((a: any) => a.ID_CLIENTE === p.ID_CLIENTE).length,
            NO_ASISTIO: inasistencias.filter((i: any) => i.ID_CLIENTE === p.ID_CLIENTE).length
          };
        });


        // 🔹 FILTRO POR IDENTIFICACIÓN
        if (this.filtroIdentificacion.trim() !== '') {
          lista = lista.filter((a: any) =>
            a.IDENTIFICACION === this.filtroIdentificacion.trim()
          );
        }

        // 🔹 FILTRO POR FECHAS
        if (this.fechaInicio && this.fechaFin) {
          const inicio = new Date(this.fechaInicio);
          const fin = new Date(this.fechaFin);

          lista = lista.filter((a: any) => {
            const fecha = new Date(a.FECHA_ACTIVIDAD);
            return fecha >= inicio && fecha <= fin;
          });
        }

        // 🔹 UNIR CON CLIENTE PARA EDAD + SEXO
        lista = this.unirDatosConCliente(lista);

        // 🔹 PROCESAR RESULTADO
        this.asistenciasFiltradas = lista.map((p: any) => {

          let resultado: number | string = 0;

          if (this.tipoInformeSeleccionado === 'asistencias') {
            resultado = p.ASISTIO;
          }

          if (this.tipoInformeSeleccionado === 'inasistencias') {
            resultado = p.NO_ASISTIO;
          }

          if (this.tipoInformeSeleccionado === 'porcentaje') {
            const total = p.ASISTIO + p.NO_ASISTIO;
            resultado = total > 0 ? ((p.ASISTIO / total) * 100).toFixed(1) + '%' : '0%';
          }

          return {
            ...p,
            RESULTADO: resultado
          };
        });

        // 🔹 ENVIAR DATOS A LOS GRÁFICOS
        this.datosGraficos.emit(this.asistenciasFiltradas);
        this.datosParaInforme.emit({
          tipoInforme: this.tipoInformeSeleccionado,
          evento: this.eventoSeleccionado,
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
          datos: this.asistenciasFiltradas
        });


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
        const asistio = asistencias.filter((a: any) =>
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
    this.datosGraficos.emit([]);
    this.mostrarError=false;
  }


  generarInforme() {

    if (!this.asistenciasFiltradas.length) {
      alert("Primero consulte las asistencias");
      return;
    }

    if (!this.graficaBase64) {
      alert("La gráfica aún no está generada");
      return;
    }

    const idUsuario = Number(localStorage.getItem('idUsuario'));

    // 👉 Obtener el cliente SOLO si se filtró por identificación
    let clienteFinal = null;

    if (this.filtroIdentificacion.trim() !== "") {
      const cliente = this.asistenciasFiltradas[0]; // siempre será 1 si filtras por cédula
      clienteFinal = cliente?.ID_CLIENTE ?? null;
    }

    const data = {
      generarPDF: true,
      tipoInforme: this.tipoInformeSeleccionado,
      usuario: idUsuario,
      evento: Number(this.eventoSeleccionado),
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      datos: this.asistenciasFiltradas,
      grafica: this.graficaBase64,
      cliente: clienteFinal   // 🔥 LO NUEVO
    };

    this.informeService.insertar(data).subscribe({
      next: (res: any) => {
        if (res.resultado === 'OK') {
          window.open(res.urlPDF, '_blank');
        }
      },
      error: err => console.error(err)
    });
  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }




}
