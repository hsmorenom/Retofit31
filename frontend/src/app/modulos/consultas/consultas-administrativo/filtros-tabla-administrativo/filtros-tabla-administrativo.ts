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

  // Filtros
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

  // ========================
  // ▶ CONSULTAR INFORMACIÓN
  // ========================
  consultarAdministrativo() {

    if (!this.tipoInformeSeleccionado) {
      alert("Seleccione un tipo de informe");
      return;
    }

    let lista = [...this.usuarios];

    // 🔹 FILTRO POR IDENTIFICACIÓN
    if (this.filtroIdentificacion.trim() !== '') {
      lista = lista.filter(u =>
        String(u.IDENTIFICACION) === this.filtroIdentificacion.trim()
      );
    }

    // 🔹 FILTRO POR TIPO DE USUARIO (texto)
    if (this.tipoUsuarioSeleccionado !== '') {
      lista = lista.filter(u =>
        String(u.TIPO_USUARIO) === this.tipoUsuarioSeleccionado
      );
    }

    // 🔹 PROCESAR EL TIPO DE INFORME
    const resultado = this.procesarInforme(lista);

    this.usuariosFiltrados = resultado;

    // 🔹 ENVIAR DATOS A GRÁFICOS
    const dataGrafico = this.armarDatosGrafico(resultado);
    this.datosGraficos.emit(dataGrafico);

    let clienteFinal = null;

    // si filtró por identificación, tomar el primer resultado (siempre es 1)
    if (this.filtroIdentificacion.trim() !== "" && this.usuariosFiltrados.length > 0) {
      clienteFinal = this.usuariosFiltrados[0].ID_CLIENTE;
    }

    // 🔹 ENVIAR A PDF
    this.datosParaInforme.emit({
      tipoInforme: this.tipoInformeSeleccionado,
      datos: this.usuariosFiltrados,
      cliente: clienteFinal
    });




  }

  // ========================
  // ▶ PROCESAR INFORME
  // ========================
  procesarInforme(lista: any[]) {

    const tipo = this.tipoInformeSeleccionado;

    // --ESTADOS--
    if (tipo === 'cantidad_estados') {

      const activos = lista.filter(u => Number(u.ESTADO) === 1).length;
      const inactivos = lista.filter(u => Number(u.ESTADO) === 0).length;

      return [
        { ETIQUETA: 'Activos', VALOR: activos },
        { ETIQUETA: 'Inactivos', VALOR: inactivos }
      ];
    }

    // --- CANTIDAD SEXO---

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

    // --- TIPO DE USUARIO (ADMINISTRADOR, CLIENTE, ETC.) ---
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

    // --- LISTADO DETALLADO ---
    if (tipo === 'listado_detallado') {
      return lista.map(u => ({
        ID_CLIENTE: u.ID_CLIENTE,
        IDENTIFICACION: u.IDENTIFICACION,
        NOMBRES: u.NOMBRES,
        APELLIDOS: u.APELLIDOS,
        SEXO: u.SEXO,
        ESTADO: Number(u.ESTADO) === 1 ? 'ACTIVO' : 'INACTIVO',
        TIPO_USUARIO: u.TIPO_USUARIO,
        TIPO_USUARIO_NOMBRE: u.TIPO_USUARIO // ya viene con nombre
      }));
    }

    return [];
  }

  // ========================
  // ▶ ARMAR DATOS PARA GRAFICOS
  // ========================
  armarDatosGrafico(lista: any[]) {

    // No graficamos listado detallado
    if (this.tipoInformeSeleccionado === 'listado_detallado') {
      return [];
    }

    return lista.map(item => ({
      etiqueta: item.ETIQUETA,
      valor: item.VALOR
    }));
  }

  // ========================
  // ▶ LIMPIAR
  // ========================
  limpiarFiltros() {
    this.filtroIdentificacion = '';
    this.tipoUsuarioSeleccionado = '';
    this.tipoInformeSeleccionado = '';
    this.usuariosFiltrados = [];
    this.datosGraficos.emit([]);
  }

  // ========================
  // ▶ GENERAR INFORME PDF
  // ========================
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

    // 🔥 IDENTIFICAR CLIENTE SOLO SI SE FILTRÓ POR CÉDULA Y ES LISTADO DETALLADO
    let clienteFinal = null;

    if (
      this.tipoInformeSeleccionado === 'listado_detallado' &&
      this.filtroIdentificacion.trim() !== '' &&
      this.usuariosFiltrados.length === 1
    ) {
      // Aquí toma el ID real del cliente desde la lista original de usuarios
      const cliente = this.usuarios.find(
        u => String(u.IDENTIFICACION) === this.filtroIdentificacion.trim()
      );

      if (cliente) {
        clienteFinal = cliente.ID_CLIENTE;
      }
    }

    const data = {
      generarPDF: true,
      tipoInforme: this.tipoInformeSeleccionado,
      usuario: idUsuario,
      datos: this.usuariosFiltrados,
      grafica: this.graficaBase64,
      cliente: clienteFinal   // 🔥🔥 SE AGREGA AQUÍ
    };

    this.informeService.insertar(data).subscribe(res => {
      if (res.resultado === 'OK') {
        window.open(res.urlPDF, '_blank');
      }
    });
  }


}
