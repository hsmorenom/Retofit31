import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClienteService } from '../../services/cliente';
import { CiudadService } from '../../services/ciudad';
import { Tipo_usuarioService } from '../../services/tipo-usuario';
import { UsuarioService } from '../../services/usuario';
import { jsPDF } from 'jspdf';


interface Cliente {
  ID: number;
  ID_CLIENTE: number;
  IDENTIFICACION: string;
  TIPO_DOCUMENTO: string;
  ESTADO: number;
  NOMBRES: string;
  APELLIDOS: string;
  ID_USUARIO: number;
  PRIMER_NOMBRE: string;
  SEGUNDO_NOMBRE: string;
  PRIMER_APELLIDO: string;
  SEGUNDO_APELLIDO: string;
  FECHA_NACIMIENTO: string;
  EMAIL: string;
  DIRECCION: string;
  CIUDAD: string;
  TELEFONO: string;
  TIPO_USUARIO: string;
  ASISTENCIA: string;
  FOTO_PERFIL_URL?: string;
}



export interface ClienteResponse {
  ID_CLIENTE: number;
  USUARIO: number;
  // agrega aquí otros campos que pueda devolver tu API
}

@Component({
  selector: 'app-administrativo',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  providers: [ClienteService],
  templateUrl: './administrativo.html'
})
export class Administrativo implements OnInit {
  mostrarFormulario = false;
  mostrarFormularioEditar = false;
  mostrarError = false;
  mostrarClave = false;
  mostrarConfirmarClave = false;

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  filtroTexto: string = '';
  ciudades: any[] = [];
  tipoUsuario: any[] = [];

  // Usuario en edición
  usuarioEditado: any = this.resetUsuarioEditado();

  // Usuario nuevo
  nuevoUsuario: any = this.resetFormulario();

  constructor(
    private clienteService: ClienteService,
    private ciudadService: CiudadService,
    private tipoUsuarioService: Tipo_usuarioService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.cargarClientes();
    this.nuevoUsuario = this.resetFormulario();
    this.mostrarFormulario = false;
    this.cargarCiudades();
    this.cargarTipoUsuarios();
  }

  // 🔹 Consultar clientes
  cargarClientes(): void {
    this.clienteService.consultarParaAdmon().subscribe({
      next: (data: Cliente[]) => {
        this.clientes = data;
        this.clientesFiltrados = [...this.clientes];
      },
      error: (err: any) => console.error('Error al cargar clientes:', err)
    });
  }

  // 🔹 Abrir formulario de edición
  editarCliente(idCliente: number) {
    const registro = this.clientesFiltrados.find(c => c.ID_CLIENTE === idCliente);

    if (registro) {
      this.usuarioEditado = {
        ...registro,
        CONTRASENA: '',
        CONFIRMAR: ''
      };
      this.mostrarFormularioEditar = true;
    } else {
      alert('Cliente no encontrado');
    }
  }



  // 🔹 Actualizar cliente
  actualizarCliente() {
    if (!this.usuarioEditado.PRIMER_NOMBRE || !this.usuarioEditado.ASISTENCIA) {
      this.mostrarError = true;
      return;
    }

    if (this.usuarioEditado.CONTRASENA || this.usuarioEditado.CONFIRMAR) {
        if ((this.usuarioEditado.CONTRASENA || '').trim() !== (this.usuarioEditado.CONFIRMAR || '').trim()) {
          alert("Las contraseñas no coinciden");
          return;
        }
      }

    // Si ya tienes ID_CLIENTE no vuelvas a buscarlo
    if (this.usuarioEditado.ID_CLIENTE) {
      this.enviarActualizacion(this.usuarioEditado.ID_CLIENTE);
    } else {
      // 🔹 Buscar cliente por ID_USUARIO
      this.clienteService.obtenerClientePorUsuario(this.usuarioEditado.ID_USUARIO)
        .subscribe(res => {
          console.log('Respuesta del backend:', res);

          if (res.resultado === 'OK' && res.cliente?.ID_CLIENTE) {
            this.usuarioEditado.ID_CLIENTE = res.cliente.ID_CLIENTE;
            this.enviarActualizacion(this.usuarioEditado.ID_CLIENTE);
          } else {
            alert(res.mensaje || "Cliente no encontrado");
          }
        }, err => console.error('Error en la petición', err));
    }
  }

  private enviarActualizacion(idCliente: number) {
    const datosParaEnviar = {
      id_cliente: this.usuarioEditado.ID_CLIENTE,
      tipo_documento: this.usuarioEditado.TIPO_DOCUMENTO || null,
      identificacion: this.usuarioEditado.IDENTIFICACION || null,
      fecha_nacimiento: this.usuarioEditado.FECHA_NACIMIENTO || null,
      foto_perfil_url: this.usuarioEditado.FOTO_PERFIL_URL || null,
      direccion: this.usuarioEditado.DIRECCION || null,
      telefono: this.usuarioEditado.TELEFONO || null,
      contacto_emergencia: this.usuarioEditado.CONTACTO_EMERGENCIA || null,
      telefono_emergencia: this.usuarioEditado.TELEFONO_EMERGENCIA || null,
      ciudad: this.usuarioEditado.CIUDAD || null,
      sexo: this.usuarioEditado.SEXO || null,

      tipo_usuario: this.usuarioEditado.TIPO_USUARIO || null,
      primer_nombre: this.usuarioEditado.PRIMER_NOMBRE,
      segundo_nombre: this.usuarioEditado.SEGUNDO_NOMBRE || null,
      primer_apellido: this.usuarioEditado.PRIMER_APELLIDO,
      segundo_apellido: this.usuarioEditado.SEGUNDO_APELLIDO || null,
      email: this.usuarioEditado.EMAIL,
      clave: this.usuarioEditado.CONTRASENA || null,
      estado: this.usuarioEditado.ESTADO === 1 ? "activo" : "inactivo"
    };

    this.clienteService.editarParaAdmon(idCliente, datosParaEnviar).subscribe(
      res => {
        if (res.resultado === 'OK') {
          alert('Cliente actualizado con éxito');
          this.mostrarFormularioEditar = false;

          // 🔹 Recargar la página para ver los cambios
          window.location.reload();
        } else {
          alert(res.mensaje);
        }
      },
      err => console.error('Error en la petición', err)
    );

  }


  cancelarEdicion() {
    this.mostrarFormularioEditar = false;
    this.usuarioEditado = this.resetUsuarioEditado();
    this.mostrarError = false;
  }

  // 🔹 Nuevo usuario
  agregarUsuario(): void {
    this.mostrarFormulario = true;
    this.nuevoUsuario = this.resetFormulario();
    this.mostrarError = false;
  }

  volverLista(): void {
    this.mostrarFormulario = false;
    this.nuevoUsuario = this.resetFormulario();
    this.mostrarError = false;
  }

  guardarUsuario(): void {
    this.mostrarError = true;

    if (
      !this.nuevoUsuario.tipo_usuario ||
      !this.nuevoUsuario.primer_nombre ||
      !this.nuevoUsuario.primer_apellido ||
      !this.nuevoUsuario.email ||
      !this.nuevoUsuario.clave ||
      !this.nuevoUsuario.confirmar_clave ||
      !this.nuevoUsuario.fecha_nacimiento ||
      !this.nuevoUsuario.direccion ||
      !this.nuevoUsuario.ciudad ||
      !this.nuevoUsuario.telefono
    ) {
      alert('Complete todos los campos obligatorios');
      console.log('Campos obligatorios no completados', this.nuevoUsuario);
      return;
    }

    if (this.nuevoUsuario.clave !== this.nuevoUsuario.confirmar_clave) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const datosParaEnviar = {
      tipo_usuario: this.nuevoUsuario.tipo_usuario,
      primer_nombre: this.nuevoUsuario.primer_nombre,
      segundo_nombre: this.nuevoUsuario.segundo_nombre || '',
      primer_apellido: this.nuevoUsuario.primer_apellido,
      segundo_apellido: this.nuevoUsuario.segundo_apellido || '',
      email: this.nuevoUsuario.email,
      clave: this.nuevoUsuario.clave,
      estado: this.nuevoUsuario.estado,
      fecha_nacimiento: this.nuevoUsuario.fecha_nacimiento,
      direccion: this.nuevoUsuario.direccion,
      telefono: this.nuevoUsuario.telefono,
      ciudad: this.nuevoUsuario.ciudad,

      tipo_documento: this.nuevoUsuario.tipo_documento,
      identificacion: this.nuevoUsuario.identificacion,
      contacto_emergencia: this.nuevoUsuario.contacto_emergencia,
      telefono_emergencia: this.nuevoUsuario.telefono_emergencia,
      sexo: this.nuevoUsuario.sexo
    };

    this.clienteService.insertarParaAdmon(datosParaEnviar).subscribe({
      next: res => {
        if (res.resultado === 'OK') {
          this.volverLista();
          this.cargarClientes();
          alert(res.mensaje);
        } else {
          alert('Error al guardar usuario: ' + res.mensaje);
        }
      },
      error: err => console.error('Error al guardar usuario:', err)
    });
  }

  // 🔹 Eliminar usuario
  eliminarUsuario(idUsuario: number): void {
    if (confirm('¿Está seguro de eliminar este usuario y el cliente asociado?')) {
      this.clienteService.eliminar(idUsuario).subscribe({
        next: res => {
          if (res.resultado === 'OK') {
            alert(res.mensaje);
            this.cargarClientes();
          } else {
            alert('Error: ' + res.mensaje);
          }
        },
        error: err => console.error('Error al eliminar usuario:', err)
      });
    }
  }

  // 🔹 Cambiar estado
  cambiarEstado(idUsuario: number): void {
    if (confirm(`¿Desea cambiar el estado del usuario?`)) {
      this.usuarioService.cambiarEstado(idUsuario).subscribe({
        next: res => {
          if (res.resultado === 'OK') {
            alert(res.mensaje);
            this.cargarClientes(); // refresca la tabla
          } else {
            alert('Error: ' + res.mensaje);
          }
        },
        error: err => console.error('Error al cambiar estado:', err)
      });
    }
  }

  // 🔹 Filtro
  filtrarTabla(): void {
    const texto = this.filtroTexto.trim().toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c =>
      c.NOMBRES.toLowerCase().includes(texto) ||
      c.APELLIDOS.toLowerCase().includes(texto) ||
      c.IDENTIFICACION.toString().includes(texto)
    );
  }

  limpiarFiltro(): void {
    this.filtroTexto = '';
    this.clientesFiltrados = [...this.clientes];
  }

  // 🔹 Helpers
  resetFormulario() {
    return {
      tipo_usuario: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      email: '',
      clave: '',
      confirmar_clave: '',
      fecha_nacimiento: '',
      direccion: '',
      telefono: '',
      ciudad: '',

      tipo_documento: 'N/A',
      identificacion: '0',
      contacto_emergencia: 'N/A',
      telefono_emergencia: 'N/A',
      sexo: 'N/A',
      estado: '1'
    };
  }

  resetUsuarioEditado() {
    return {
      ID_USUARIO: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      fecha_nacimiento: '',
      email: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      tipo_usuario: '',
      estado: 1,
      asistencia: 'Presente',
      clave: '',
      confirmar_clave: ''
    };
  }

  private extraerPrimeraPalabra(texto: string): string {
    return texto ? texto.split(' ')[0] || '' : '';
  }

  private extraerSegundaPalabra(texto: string): string {
    if (!texto) return '';
    const partes = texto.split(' ');
    return partes.length > 1 ? partes[1] : '';
  }

  cargarCiudades() {
    this.ciudadService.consultar().subscribe({
      next: (res: any[]) => {
        // Tu backend devuelve un array directo (por tu modelo/controlador),
        // así que debería ser ya un array:
        this.ciudades = Array.isArray(res) ? res : [];
        console.log('📍 Ciudades cargadas:', this.ciudades);
        // Para depurar: mira cómo vienen los nombres de campos
        if (this.ciudades.length) {
          console.log('Ejemplo ciudad[0]:', this.ciudades[0]);
        }
      },
      error: (err) => {
        console.error('Error al cargar tipo de usuario:', err);
      }
    });
  }

  getNombreCiudad(id: number | null): string {
    if (id === null) return '';
    const ciudad = this.ciudades.find(c => c.ID_CIUDAD === id);
    return ciudad ? ciudad.NOMBRE : '';
  }

  cargarTipoUsuarios() {
    this.tipoUsuarioService.consultar().subscribe({
      next: (res: any[]) => {
        // Tu backend devuelve un array directo (por tu modelo/controlador),
        // así que debería ser ya un array:
        this.tipoUsuario = Array.isArray(res) ? res : [];
        console.log('📍 Tipo de usuarios cargadas:', this.tipoUsuario);
        // Para depurar: mira cómo vienen los nombres de campos
        if (this.tipoUsuario.length) {
          console.log('Ejemplo tipo usuario[0]:', this.tipoUsuario[0]);
        }
      },
      error: (err) => {
        console.error('Error al cargar tipo de usuario:', err);
      }
    });
  }

  getTipoUsuario(id: number): string {
    if (id === null) return 'Hola';
    const tipo_usuario = this.tipoUsuario.find(c => c.ID_TIPO_USUARIO === id);
    return tipo_usuario ? tipo_usuario.TIPO : '';
  }

  async descargarFicha(cliente: Cliente) {
  // 🔹 Nombre completo
  const fullName = [
    cliente.PRIMER_NOMBRE,
    cliente.SEGUNDO_NOMBRE,
    cliente.PRIMER_APELLIDO,
    cliente.SEGUNDO_APELLIDO
  ].filter(Boolean).join(' ').trim();

  const documento = `${cliente.TIPO_DOCUMENTO || 'CC'} - ${cliente.IDENTIFICACION || ''}`;
  const sexo = (cliente as any).SEXO || 'N/A';
  const fechaNac = cliente.FECHA_NACIMIENTO || 'N/A';
  const email = cliente.EMAIL || 'N/A';
  const direccion = cliente.DIRECCION || 'N/A';
  const ciudad = this.getNombreCiudad(Number(cliente.CIUDAD)) || '';
  const telefono = cliente.TELEFONO || 'N/A';
  const emergenciaNombre = (cliente as any).CONTACTO_EMERGENCIA || 'N/A';
  const emergenciaTelefono = (cliente as any).TELEFONO_EMERGENCIA || 'N/A';

  // 🔹 Foto actual (solo nombre del archivo)
// Asegúrate que FOTO_PERFIL_URL solo tenga el nombre:
const archivo = cliente.FOTO_PERFIL_URL?.split('/').pop()?.split('?')[0];
const fotoUrl = `http://localhost:8000/backend/api/imagenes/ver-foto-perfil.php?archivo=${archivo}`;


  // 🔹 Crear PDF
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const verde = { r: 34, g: 85, b: 34 };
  const gris = { r: 95, g: 95, b: 95 };
  const divider = { r: 190, g: 190, b: 190 };
  let y = 20;

  // 🔹 Agregar foto
  if (cliente.FOTO_PERFIL_URL) {
    try {
      let base64 = await this.urlToBase64(fotoUrl);
      // Convertir WebP a PNG si es necesario
      if (base64.startsWith('data:image/webp')) {
        base64 = await this.convertWebpToPng(base64);
      }
      const imgType = base64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      const fotoSize = 60;
      const fotoX = (pageW - fotoSize) / 2;
      const fotoY = y;
      doc.addImage(base64, imgType, fotoX, fotoY, fotoSize, fotoSize);
      y += fotoSize + 10;
    } catch (e) {
      console.warn('⚠️ No se pudo cargar la foto', e);
    }
  }

  // 🔹 Nombre completo y datos
  doc.setFontSize(10);
  doc.setTextColor(gris.r, gris.g, gris.b);
  doc.text('Nombre completo', pageW / 2, y + 6, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text(fullName.toUpperCase(), pageW / 2, y + 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(gris.r, gris.g, gris.b);
  doc.text('Documento', pageW / 2, y + 28, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(documento, pageW / 2, y + 35, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(gris.r, gris.g, gris.b);
  doc.text('Sexo', pageW / 2, y + 47, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(sexo, pageW / 2, y + 54, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(gris.r, gris.g, gris.b);
  doc.text('Fecha de nacimiento', pageW / 2, y + 66, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(fechaNac, pageW / 2, y + 73, { align: 'center' });

  // 🔹 Cajas de información
  const startCardsY = y + 85;
  const gap = 10;
  const colW = (pageW - (margin * 2) - gap) / 2;
  const leftX = margin;
  const rightX = margin + colW + gap;
  const cardH = 80;

  doc.setDrawColor(divider.r, divider.g, divider.b);
  doc.line(pageW / 2, startCardsY - 8, pageW / 2, startCardsY + cardH + 6);

  // --- Datos de contacto ---
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(leftX, startCardsY, colW, cardH, 3, 3, 'S');
  doc.setFontSize(14);
  doc.setTextColor(verde.r, verde.g, verde.b);
  doc.text('DATOS DE CONTACTO', leftX + 7, startCardsY + 12);

  doc.setFontSize(10);
  doc.setTextColor(gris.r, gris.g, gris.b);
  let ly = startCardsY + 24;
  const lh = 14;

  const leftFields = [
    ['Correo electrónico', email],
    ['Dirección', direccion],
    ['Ciudad', ciudad],
    ['Teléfono', telefono]
  ];

  leftFields.forEach(([label, value]) => {
    doc.text(label, leftX + 7, ly);
    doc.setTextColor(0, 0, 0);
    doc.text(value, leftX + 7, ly + 6);
    doc.setTextColor(gris.r, gris.g, gris.b);
    ly += lh;
  });

  // --- Contacto de emergencia ---
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(rightX, startCardsY, colW, cardH, 3, 3, 'S');
  doc.setFontSize(14);
  doc.setTextColor(verde.r, verde.g, verde.b);
  doc.text('CONTACTO DE EMERGENCIA', rightX + 7, startCardsY + 12);

  doc.setFontSize(10);
  doc.setTextColor(gris.r, gris.g, gris.b);
  let ry = startCardsY + 24;

  const rightFields = [
    ['Nombre completo', emergenciaNombre],
    ['Teléfono', emergenciaTelefono]
  ];

  rightFields.forEach(([label, value]) => {
    doc.text(label, rightX + 7, ry);
    doc.setTextColor(0, 0, 0);
    doc.text(value, rightX + 7, ry + 6);
    doc.setTextColor(gris.r, gris.g, gris.b);
    ry += lh;
  });

  // 🔹 Guardar PDF
  const safeName = fullName.replace(/\s+/g, '_');
  doc.save(`${safeName || 'Cliente'}_Ficha.pdf`);
}

/** Convierte URL a Base64 */
private async urlToBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar la imagen');
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Error cargando la imagen:', err);
    return '';
  }
}

/** Convierte WebP a PNG */
private async convertWebpToPng(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No se pudo obtener el contexto');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
  });
}

}



