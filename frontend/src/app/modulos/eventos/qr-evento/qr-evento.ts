import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

@Component({
  selector: 'app-qr-evento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-evento.html'
})
export class QrEvento {

  // 🔹 Emitimos evento al padre para cerrar la vista
  @Output() cerrar = new EventEmitter<void>();
  @Input() evento: any; // <--- muy importante
  @ViewChild('qrContainer', { static: false }) qrContainer!: ElementRef;

  ngOnInit() {
  
  }

  get qrUrl(): string | null {
    if (this.evento?.QR_DE_EVENTO && this.evento.QR_DE_EVENTO.endsWith('.png')) {
      const archivo = this.evento.QR_DE_EVENTO.split('/').pop(); // obtiene solo el nombre
      return `http://localhost:8000/api/api/qr/ver-qr.php?archivo=${archivo}`;
    }
    return null;
  }


  // 🔹 Cierra el formulario
  cerrarVentana(): void {
    this.cerrar.emit();
  }

  descargarPDF(): void {
    if (!this.qrContainer) {
      alert('⚠️ No se encontró el contenedor del QR.');
      return;
    }

    // 🧩 Crear un contenedor limpio SIN estilos Tailwind
    const qrImage = this.qrContainer.nativeElement.querySelector('img');
    if (!qrImage) {
      alert('⚠️ No se encontró la imagen del QR.');
      return;
    }

    // Crear un div temporal limpio (sin Tailwind)
    const cleanContainer = document.createElement('div');
    cleanContainer.style.backgroundColor = '#ffffff';
    cleanContainer.style.display = 'flex';
    cleanContainer.style.justifyContent = 'center';
    cleanContainer.style.alignItems = 'center';
    cleanContainer.style.padding = '30px';
    cleanContainer.style.width = '400px';
    cleanContainer.style.height = '400px';
    cleanContainer.style.border = '1px solid #ccc';

    // Clonar solo la imagen QR dentro del contenedor
    const imgClone = qrImage.cloneNode(true) as HTMLImageElement;
    imgClone.style.width = '300px';
    imgClone.style.height = '300px';
    cleanContainer.appendChild(imgClone);

    // Añadir el contenedor temporal al DOM (fuera de pantalla)
    document.body.appendChild(cleanContainer);

    html2canvas(cleanContainer, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    })
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 120;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const posX = (210 - imgWidth) / 2;
        const posY = 80;

        pdf.setFont('helvetica', 'bold');

        pdf.text(`Código QR del evento: ${this.evento.NOMBRE_EVENTO}`, 20, 50);
        pdf.addImage('assets/images/header/logo_retofit-removebg-preview.png', 'PNG', 20, 10, 30, 30);
        pdf.setFontSize(16);


        pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight);
        pdf.text(`Fecha del evento: ${this.evento.FECHA_ACTIVIDAD}`, 20, posY + imgHeight + 10);
        pdf.text(`Lugar: ${this.evento.LUGAR_DE_ACTIVIDAD}`, 20, posY + imgHeight + 20);
        pdf.text(`Instructor: ${this.evento.INSTRUCTOR}`, 20, posY + imgHeight + 30);

        // 🏷️ Pie de página
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text('Retrofit31 - Football Players Training', 210 / 2, 280, { align: 'center' });

        pdf.save(`QR_${this.evento.NOMBRE_EVENTO}.pdf`);
      })
      .catch(err => {
        console.error('Error generando el PDF:', err);
        alert('❌ Ocurrió un error al generar el PDF.');
      })
      .finally(() => {
        // Eliminar el contenedor temporal
        document.body.removeChild(cleanContainer);
      });
  }



  // 🔹 Lógica de guardado (más adelante puedes conectar al servicio)
  guardarEvento(): void {
    // Aquí va la lógica de guardado al backend
    alert('Evento guardado correctamente.');
    this.cerrarVentana(); // Cierra al guardar
  }






}
