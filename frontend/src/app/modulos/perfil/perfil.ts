import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InfoBasica } from './info-basica/info-basica';
import { DatosContacto } from './datos-contacto/datos-contacto';
import { ContactoEmergencia } from './contacto-emergencia/contacto-emergencia';
import { CambiarClave } from './cambiar-clave/cambiar-clave';
import { UsuarioService } from '../../services/usuario';
import { ClienteService } from '../../services/cliente';
import { CiudadService } from '../../services/ciudad';
import { DepartamentoService } from '../../services/departamento';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, InfoBasica, DatosContacto, ContactoEmergencia, CambiarClave, RouterModule],
  templateUrl: './perfil.html'
})
export class Perfil implements OnInit {
  mostrarFormularioClave = false;
  modoEdicion = false;
  datosUsuario: any;
  datosOriginales: any;
  cambiosPendientes: any = {};
  ciudades: any[] = [];
  departamentos: any[] = [];
  mostrarError =false;

  constructor(
    public router: Router,
    private usuarioService: UsuarioService,
    private clienteService: ClienteService,
    private ciudadService: CiudadService,
    private departamentoService: DepartamentoService
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarCiudades();
    this.cargarDepartamentos();
  }


  cargarDatosUsuario(): void {
    const idClienteStr = localStorage.getItem('idCliente');

    if (!idClienteStr || isNaN(Number(idClienteStr))) {
      console.error('⚠️ No hay usuario logueado o el ID es inválido');
      this.router.navigate(['']);
      return;
    }

    const idCliente = Number(idClienteStr);

    this.clienteService.filtrarPorId(idCliente).subscribe({
      next: (res: any) => {
        this.datosUsuario = Array.isArray(res) ? res[0] : res;
        this.datosOriginales = JSON.parse(JSON.stringify(this.datosUsuario)); 
        console.log('✅ Datos completos del usuario:', this.datosUsuario);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
      }
    });
  }

  private cargarCiudades(): void {
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
        console.error('Error al cargar ciudades:', err);
      }
    });
  }

  private cargarDepartamentos() {
    this.departamentoService.consultar().subscribe({
      next: (res: any[]) => {
        // Tu backend devuelve un array directo (por tu modelo/controlador),
        // así que debería ser ya un array:
        this.departamentos = Array.isArray(res) ? res : [];
        console.log('📍 Ciudades cargadas:', this.departamentos);
        // Para depurar: mira cómo vienen los nombres de campos
        if (this.departamentos.length) {
          console.log('Ejemplo ciudad[0]:', this.departamentos[0]);
        }
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
      }
    });
  }

  onDatosCambiados(cambios: any): void {
    // Acumular cambios
    this.cambiosPendientes = { ...this.cambiosPendientes, ...cambios };

    if (cambios.ID_CIUDAD !== undefined) {
      const idCiudad = cambios.ID_CIUDAD === null ? null : Number(cambios.ID_CIUDAD);
      const ciudadObj = this.ciudades.find(c => Number(c.ID_CIUDAD) === idCiudad);
      const nombreCiudad = ciudadObj ? ciudadObj.NOMBRE : (this.datosUsuario?.CIUDAD ?? '');
      const idDepartamento = ciudadObj ? ciudadObj.DEPARTAMENTO : (this.datosUsuario?.ID_DEPARTAMENTO ?? '');

      // Buscar nombre del departamento con base en ID_DEPARTAMENTO
      const departamentoObj = this.departamentos.find(d => Number(d.ID_DEPARTAMENTO) === idDepartamento);
      const nombreDepartamento = departamentoObj ? departamentoObj.NOMBRE : (this.datosUsuario?.NOMBRE_DEPARTAMENTO ?? '');

      // Actualizar datosUsuario en tiempo real para visualización
      this.datosUsuario = { ...this.datosUsuario, ...cambios, ID_CIUDAD: idCiudad, CIUDAD: nombreCiudad, ID_DEPARTAMENTO: idDepartamento, NOMBRE_DEPARTAMENTO: nombreDepartamento };
    } else {
      this.datosUsuario = { ...this.datosUsuario, ...cambios }
    }
    console.log('Cambios pendientes actualizados:', this.cambiosPendientes);
  }

  toggleClave(): void {
    this.mostrarFormularioClave = !this.mostrarFormularioClave;
  }

  toggleCancelarEdicion():void{
    if(this.modoEdicion===true){
      this.modoEdicion=!this.modoEdicion;
      this.cargarDatosUsuario();
    }
  }

  toggleEdicion(): void {
    if (this.modoEdicion) {
      this.guardarCambios();
    } else {
      this.modoEdicion = true;
    }
  }

  guardarCambios(): void {
    if (!this.datosUsuario?.ID_USUARIO || !this.datosUsuario?.ID_CLIENTE) {
      console.error('❌ IDs de usuario/cliente no encontrados');
      return;
    }

    // Verificar completado de campos
    if (!this.datosUsuario.PRIMER_NOMBRE || !this.datosUsuario.PRIMER_APELLIDO || !this.datosUsuario.EMAIL) {
      alert('Por favor llena los campos obligatorios')
      this.mostrarError = true;
      return
    }
    // Verificar completado de campos
    if (!this.datosUsuario.TIPO_DOCUMENTO || !this.datosUsuario.IDENTIFICACION || !this.datosUsuario.ID_CIUDAD || !this.datosUsuario.FECHA_NACIMIENTO || !this.datosUsuario.SEXO || !this.datosUsuario.CONTACTO_EMERGENCIA || !this.datosUsuario.TELEFONO_EMERGENCIA) {
      alert('Por favor llena los campos obligatorios')
      this.mostrarError = true;
      return
    }

    const usuarioId = this.datosUsuario.ID_USUARIO;
    const clienteId = this.datosUsuario.ID_CLIENTE;


    // Depuración: Ver qué se está enviando
    console.log('Cambios pendientes:', this.cambiosPendientes);

    if (this.datosUsuario?.FOTO_PERFIL_URL) {
      this.cambiosPendientes['FOTO_PERFIL_URL'] = this.datosUsuario.FOTO_PERFIL_URL;
    }

    const { cambiosUsuario, cambiosCliente } = this.separarCambios();

    let pendientes = 0;
    let errores: any[] = [];

    // Actualizar usuario
    if (Object.keys(cambiosUsuario).length > 0) {
      pendientes++;
      this.usuarioService.editar(usuarioId, cambiosUsuario).subscribe({
        next: () => {
          console.log('✅ Usuario actualizado');
          pendientes--;
          this.verificarFinalizacion(pendientes, errores);
        },
        error: (err) => {
          console.error('❌ Error al actualizar usuario:', err);
          errores.push(err);
          pendientes--;
          this.verificarFinalizacion(pendientes, errores);
        }
      });
    }

    // Actualizar cliente
    if (Object.keys(cambiosCliente).length > 0) {
      pendientes++;
      if (cambiosCliente.ID_CIUDAD !== undefined) {
        // el backend en la tabla cliente tiene columna CIUDAD (almacena el ID)
        cambiosCliente.CIUDAD = cambiosCliente.ID_CIUDAD;
        // algunos modelos PHP esperan 'ciudad' (minúscula). Lo añadimos para compatibilidad.
        cambiosCliente.ciudad = cambiosCliente.ID_CIUDAD;
        delete cambiosCliente.ID_CIUDAD;
      }
      this.clienteService.editar(clienteId, cambiosCliente).subscribe({
        next: () => {
          console.log('✅ Cliente actualizado');
          pendientes--;
          this.verificarFinalizacion(pendientes, errores);
        },
        error: (err) => {
          console.error('❌ Error al actualizar cliente:', err.error); // Mostrar detalles del error
          errores.push(err);
          pendientes--;
          this.verificarFinalizacion(pendientes, errores);
        }
      });
    }


    if (pendientes === 0) {
      this.mostrarResultado(errores);
    }
  }

  private separarCambios(): { cambiosUsuario: any, cambiosCliente: any } {
    const cambiosUsuario: any = {};
    const cambiosCliente: any = {};

    const camposUsuario = ['PRIMER_NOMBRE', 'SEGUNDO_NOMBRE', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO', 'EMAIL'];
    const camposCliente = ['TIPO_DOCUMENTO', 'IDENTIFICACION', 'SEXO', 'FECHA_NACIMIENTO', 'FOTO_PERFIL_URL', 'DIRECCION', 'TELEFONO', 'CONTACTO_EMERGENCIA', 'TELEFONO_EMERGENCIA', 'ID_CIUDAD'];

    Object.keys(this.cambiosPendientes).forEach(key => {
      if (camposUsuario.includes(key)) {
        cambiosUsuario[key] = this.cambiosPendientes[key];
      } else if (camposCliente.includes(key)) {
        cambiosCliente[key] = this.cambiosPendientes[key];
      }
    });

    return { cambiosUsuario, cambiosCliente };
  }

  private verificarFinalizacion(pendientes: number, errores: any[]): void {
    if (pendientes === 0) {
      this.mostrarResultado(errores);
    }
  }

  private mostrarResultado(errores: any[]): void {
    if (errores.length > 0) {
      alert(`⚠️ Se produjeron ${errores.length} errores al guardar. Revisa la consola para más detalles.`);
      console.error('Errores detallados:', errores);
    } else {
      alert('✅ Cambios guardados con éxito');
      this.cambiosPendientes = {};
      this.cargarDatosUsuario(); // Recargar para mostrar lo último
    }
    this.modoEdicion = false;
  }
}
