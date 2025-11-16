import { Component, ElementRef, ViewChild } from '@angular/core';
import { BrowserQRCodeReader, IScannerControls, BrowserCodeReader } from '@zxing/browser';
import { AsistenciaService } from '../../../services/asistencia';


@Component({
  selector: 'app-captura-asistencia',
  standalone: true,
  templateUrl: './captura-asistencia.html',
})
export class CapturaAsistencia {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;

  private codeReader = new BrowserQRCodeReader();
  private controls: IScannerControls | null = null;

  resultadoQR: string | null = null;
  scanning = false;

  constructor(private asistenciaService: AsistenciaService) { }

  async iniciarEscaneo() {
    try {
      this.scanning = true;

      // ✅ Obtener dispositivos de video (funciona siempre)
      const devices = await BrowserCodeReader.listVideoInputDevices();

      if (devices.length === 0) {
        alert('No se encontró ninguna cámara.');
        return;
      }

      const selectedDeviceId = devices[0].deviceId;
      const videoElement = this.video.nativeElement;

      // ✅ Inicia el lector de QR
      this.controls = await this.codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoElement,
        (result, err) => {
          if (result) {
            this.resultadoQR = result.getText();
            this.detenerEscaneo();

            // Opcional: Procesar el QR automáticamente
            this.procesarQR(this.resultadoQR);
          }
        }
      );
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      alert('❌ No se pudo acceder a la cámara. Asegúrate de otorgar permisos.');
    }
  }



  detenerEscaneo() {
    if (this.controls) {
      this.controls.stop();
      this.controls = null;
    }
    this.scanning = false;
  }



  procesarQR(contenido: string) {
    console.log('QR detectado:', contenido);

    const url = new URL(contenido);
    const idEvento = url.searchParams.get('id_evento');

    if (!idEvento) {
      alert('❌ QR inválido. No contiene un evento válido.');
      return;
    }

    const idCliente = localStorage.getItem('id_cliente');
    if (!idCliente) {
      alert('⚠️ No se encontró un cliente logueado.');
      return;
    }

    const data = {
      evento: idEvento,
      cliente: idCliente
    };

    // 🔹 Enviar al backend
    this.asistenciaService.registrarPorQR(data).subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);

        switch (res.resultado) {
          case 'OK':
            alert('✅ Asistencia registrada correctamente.');
            break;
          case 'DUPLICADO':
            alert('⚠️ Ya habías registrado tu asistencia para este evento.');
            break;
          case 'PENDIENTE':
            alert('🕒 El evento aún no ha comenzado. Intenta más tarde.');
            break;
          case 'FINALIZADO':
            alert('⏰ El evento ya finalizó. No se puede registrar asistencia.');
            break;
          case 'NO_CLIENTE':
            alert('🚫 Solo los usuarios tipo cliente pueden registrar asistencia.');
            break;
          default:
            alert('❌ ' + res.mensaje);
        }


        // Detener cámara tras procesar QR
        this.detenerEscaneo();


      },
      error: (err) => {
        console.error('Error al registrar asistencia:', err);
        alert('❌ Hubo un problema al registrar la asistencia.');
        this.detenerEscaneo();
      }
    });
  }





}
