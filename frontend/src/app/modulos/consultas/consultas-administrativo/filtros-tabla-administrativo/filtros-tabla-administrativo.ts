import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../../services/cliente';
import { InformeService } from '../../../../services/informe';

@Component({
  selector: 'app-filtros-tabla-administrativo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './filtros-tabla-administrativo.html'
})
export class FiltrosTablaAdministrativo implements OnInit {

  @Output() datosGraficos = new EventEmitter<any[]>();
  @Output() datosParaInforme = new EventEmitter<any>();
  @Input() graficaBase64: string = '';

  filtroIdentificacion = '';
  tipoUsuarioSeleccionado = '';
  tipoInformeSeleccionado = '';

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  constructor(
    private clienteService: ClienteService,
    private informeService: InformeService
  ) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.clienteService.consultar().subscribe(res => {
      this.usuarios = Array.isArray(res) ? res : [];
    });
  }

  // ==================================
  // ▶ CONSULTAR INFORMACIÓN
  // ==================================
  consultarAdministrativo() {

    if (!this.tipoInformeSeleccionado) {
      alert("Seleccione un tipo de informe");
      return;
    }

    let lista = [...this.usuarios];

    // Filtro por identificación
    if (this.filtroIdentificacion.trim() !== '') {
      lista = lista.filter(u =>
        String(u.IDENTIFICACION) === this.filtroIdentificacion.trim()
      );
    }

    // Filtro por tipo de usuario
    if (this.tipoUsuarioSeleccionado !== '') {
      lista = lista.filter(u =>
        String(u.TIPO_USUARIO) === this.tipoUsuarioSeleccionado
      );
    }

    // Procesar informe
    const resultado = this.procesarInforme(lista);
    this.usuariosFiltrados = resultado;

    // Datos para gráficas
    const dataGrafico = this.armarDatosGrafico(resultado);
    this.datosGraficos.emit(dataGrafico);

    // 👇 Cliente solo si hay filtro e info detallada
    let clienteFinal = null;
    if (
      this.tipoInformeSeleccionado === 'listado_detallado' &&
      this.filtroIdentificacion.trim() !== '' &&
      this.usuariosFiltrados.length === 1
    ) {
      clienteFinal = this.usuariosFiltrados[0].ID_CLIENTE;
    }

    // Enviar info al padre (por si se necesita)
    this.datosParaInforme.emit({
      tipoInforme: this.tipoInformeSeleccionado,
      datos: this.usuariosFiltrados,
      cliente: clienteFinal
    });
  }

  // ==================================
  // ▶ PROCESAR INFORME
  // ==================================
  procesarInforme(lista: any[]) {

    const tipo = this.tipoInformeSeleccionado;

    // Cantidad por estados
    if (tipo === 'cantidad_estados') {
      const activos = lista.filter(u => Number(u.ESTADO) === 1).length;
      const inactivos = lista.filter(u => Number(u.ESTADO) === 0).length;

      return [
        { ETIQUETA: 'Activos', VALOR: activos },
        { ETIQUETA: 'Inactivos', VALOR: inactivos }
      ];
    }

    // Cantidad por sexo
    if (tipo === 'cantidad_sexos') {
      const masculino = lista.filter(u => u.SEXO === 'Masculino').length;
      const femenino = lista.filter(u => u.SEXO === 'Femenino').length;
      const otro = lista.filter(u => u.SEXO === 'Otro').length;

      return [
        { ETIQUETA: 'Masculino', VALOR: masculino },
        { ETIQUETA: 'Femenino', VALOR: femenino },
        { ETIQUETA: 'Otro', VALOR: otro }
      ];
    }

    // Cantidad por tipo de usuario
    if (tipo === 'cantidad_por_tipo_usuario') {

      const tipos = [
        { nombre: 'Administrador' },
        { nombre: 'Asistente-admon' },
        { nombre: 'Asistente-salud-deportiva' },
        { nombre: 'Usuario' }
      ];

      return tipos.map(t => ({
        ETIQUETA: t.nombre,
        VALOR: lista.filter(u => u.TIPO_USUARIO === t.nombre).length
      }));
    }

    // Listado detallado
    if (tipo === 'listado_detallado') {
      return lista.map(u => ({
        ID_CLIENTE: u.ID_CLIENTE,                    // 👈 IMPORTANTE
        IDENTIFICACION: u.IDENTIFICACION,
        NOMBRES: u.NOMBRES,
        APELLIDOS: u.APELLIDOS,
        SEXO: u.SEXO,
        ESTADO: Number(u.ESTADO) === 1 ? 'ACTIVO' : 'INACTIVO',
        TIPO_USUARIO: u.TIPO_USUARIO,
        TIPO_USUARIO_NOMBRE: u.TIPO_USUARIO        // ya viene con nombre
      }));
    }

    return [];
  }

  // ==================================
  // ▶ ARMAR DATOS PARA GRÁFICOS
  // ==================================
  armarDatosGrafico(lista: any[]) {
    if (this.tipoInformeSeleccionado === 'listado_detallado') {
      return [];
    }

    return lista.map(item => ({
      etiqueta: item.ETIQUETA,
      valor: item.VALOR
    }));
  }

  limpiarFiltros() {
    this.filtroIdentificacion = '';
    this.tipoUsuarioSeleccionado = '';
    this.tipoInformeSeleccionado = '';
    this.usuariosFiltrados = [];
    this.datosGraficos.emit([]);
  }

  // ==================================
  // ▶ GENERAR PDF ADMINISTRATIVO
  // ==================================
  generarInformeAdministrativo() {

    if (!this.usuariosFiltrados.length) {
      alert("Primero consulte la información");
      return;
    }

    if (!this.graficaBase64) {
      alert("La gráfica aún no está generada");
      return;
    }

    const idUsuario = Number(localStorage.getItem('idUsuario'));

    // Si filtró por cédula entonces sí hay CLIENTE
    let clienteFinal = null;

    if (this.filtroIdentificacion.trim() !== "") {
      const user = this.usuariosFiltrados[0];
      clienteFinal = user?.ID_CLIENTE ?? null;
    }

    const data = {
      generarPDF: true,
      tipoInforme: this.tipoInformeSeleccionado,
      usuario: idUsuario,
      datos: this.usuariosFiltrados,
      grafica: this.graficaBase64,
      cliente: clienteFinal,

      // 🔥 NUEVO: ENVIAMOS LA ENTIDAD
      entidad: "usuario",

      // 🔥 NUEVO: ENVIAMOS EL ID DEL USUARIO FILTRADO O NULL
      id_referencia: clienteFinal
    };

    this.informeService.insertar(data).subscribe(res => {
      if (res.resultado === 'OK') {
        window.open(res.urlPDF, '_blank');
      }
    });
  }

}
