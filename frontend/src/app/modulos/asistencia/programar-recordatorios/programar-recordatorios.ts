import { Component, Input, OnInit } from '@angular/core';
import { ClienteService } from '../../../services/cliente';
import { RecordatorioService } from '../../../services/recordatorio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../../../services/eventos';

@Component({
  selector: 'app-programar-recordatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programar-recordatorios.html'
})
export class ProgramarRecordatorios implements OnInit {
  @Input() mostrarError: boolean = false;

  clientesSeleccionados: any[] = [];
  documentoBusqueda: string = '';
  fechaHora = '';
  eventoSeleccionado: string = '';
  frecuencia: string = '';
  tipoNotificacion: string = '';
  eventos: any[] = [];
  mostrarError2 = false;


  constructor(
    private clienteService: ClienteService,
    private recordatorioService: RecordatorioService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    this.eventosService.consultarVigentes().subscribe({
      next: (res) => this.eventos = res,
      error: (err) => console.error('Error al obtener eventos vigentes:', err)
    });


  }


  buscarCliente() {
    if (!this.documentoBusqueda.trim()) return;

    if (!this.documentoBusqueda) {
      alert('Por favor digite el numero de identificación.');
      this.mostrarError2 = true;
      return;
    }


    this.clienteService.buscarPorDocumento(this.documentoBusqueda).subscribe({
      next: (res) => {
        const cliente =
          Array.isArray(res) && res.length > 0
            ? res[0]
            : typeof res === 'object' && Object.keys(res).length > 0
              ? res
              : null;

        if (cliente && cliente.ID_CLIENTE) {
          const existe = this.clientesSeleccionados.some(
            (c) => c.ID_CLIENTE === cliente.ID_CLIENTE
          );

          if (!existe) {
            this.clientesSeleccionados.push(cliente);
          } else {
            alert('⚠️ Este cliente ya está agregado.');
          }
        } else {
          alert('❌ No se encontró ningún cliente con esa identificación.');
        }

        this.documentoBusqueda = '';
      },
      error: (err) => {
        console.error('Error al buscar cliente:', err);
        alert('⚠️ Hubo un problema al realizar la búsqueda.');
      },
    });

  }

  eliminarCliente(id: number) {
    this.clientesSeleccionados = this.clientesSeleccionados.filter(
      (c) => c.ID_CLIENTE !== id
    );
  }

  programar() {
    if (
      this.clientesSeleccionados.length === 0 ||
      !this.eventoSeleccionado ||
      !this.frecuencia ||
      !this.tipoNotificacion
    ) {
      alert('⚠️ Por favor, completa todos los campos antes de programar.');
      this.mostrarError2 = true;
      return;
    }

    const data = {
      cliente: this.clientesSeleccionados.map((c) => c.ID_CLIENTE),
      evento: this.eventoSeleccionado,
      fecha_hora: this.fechaHora,
      tipo_notificacion: this.tipoNotificacion,
      frecuencia: this.frecuencia,
      estado: 'pendiente',
    };

    this.recordatorioService.insertar(data).subscribe({
      next: (res) => {
        if (res.resultado === 'OK') {
          alert('✅ Recordatorio programado correctamente.');
          this.limpiarFormulario();
        } else {
          alert('❌ Error al programar recordatorio.');
        }
      },
      error: (err) => {
        console.error(err);
        alert('❌ Hubo un error al conectar con el servidor.');
      },
    });
  }

  limpiarFormulario() {
    this.documentoBusqueda = '';
    this.clientesSeleccionados = [];
    this.fechaHora = '';
    this.eventoSeleccionado = '';
    this.frecuencia = '';
    this.tipoNotificacion = '';
  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }
}