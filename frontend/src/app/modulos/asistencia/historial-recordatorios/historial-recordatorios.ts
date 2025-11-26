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
  enviando: number | null = null;   // almacena el ID del recordatorio en envío
  enviado: number | null = null;    // almacena el ID del recordatorio ya enviado


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

 enviarRecordatorio(recordatorio: any) {
  const tipo = recordatorio.TIPO_NOTIFICACION || 'correo';
  const correo = recordatorio.EMAIL;
  const telefono = recordatorio.TELEFONO;
  const nombre = recordatorio.NOMBRE_CLIENTE;

  const fechaHora = recordatorio.FECHA_HORA || '';
  const partes = fechaHora.split(' ');

  const evento = {
    nombre: recordatorio.NOMBRE_EVENTO,
    fecha: partes[0] || '',
    hora: partes[1] || '',
    lugar: recordatorio.LUGAR_DE_ACTIVIDAD
  };

  this.enviando = recordatorio.ID_RECORDATORIO;
  this.enviado = null;

  // 🔹 Envío dinámico según el tipo
  this.recordatorioService
    .enviarRecordatorio(correo, nombre, evento, tipo, telefono)
    .subscribe({
      next: (res) => {
        this.enviando = null;

        if (res.resultado === 'OK') {
      

          // 🔹 Determinar nuevo estado según frecuencia y estado actual
          let nuevoEstado = 'enviado';
          if (recordatorio.FRECUENCIA === '2_dia' &&
              recordatorio.ESTADO === 'pendiente') {
            nuevoEstado = 'parcial';
          }

          // 🔹 Actualizar en BD
          this.recordatorioService
            .actualizarEstado(recordatorio.ID_RECORDATORIO, nuevoEstado)
            .subscribe({
              next: () => {
               

                // 🔹 Actualizar en la tabla visual
                const index = this.recordatorio.findIndex(
                  (r) => r.ID_RECORDATORIO === recordatorio.ID_RECORDATORIO
                );
                if (index !== -1) {
                  this.recordatorio[index].ESTADO = nuevoEstado;
                }

                // 🔹 Animación del botón
                this.enviado = recordatorio.ID_RECORDATORIO;
                setTimeout(() => (this.enviado = null), 3000);
              },
              error: (err) =>
                console.error('⚠️ Error al actualizar estado:', err),
            });
        } else {
          alert('⚠️ ' + res.mensaje);
        }
      },
      error: (err) => {
        this.enviando = null;
        console.error('❌ Error al enviar recordatorio:', err);
        alert('Error al enviar recordatorio');
      },
    });
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
