import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClienteService } from '../../services/cliente';
import { CiudadService } from '../../services/ciudad';
import { Tipo_usuarioService } from '../../services/tipo-usuario';
import { UsuarioService } from '../../services/usuario';

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


}
