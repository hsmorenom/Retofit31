import { Component } from '@angular/core';
import { AntropometricosService } from '../../../services/antropometricos';
import { ClienteService } from '../../../services/cliente';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-datos-antropometricos',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './registro-datos-antropometricos.html'
})
export class RegistroDatosAntropometricos {
  clientesSeleccionados: any[] = [];
  documentoBusqueda: string = '';
  fechaNacimiento: string | null = null;
  edadCalculada: number | null = null;
  sexoSeleccionado: string | null = null; // variable solo cuando el usuario se considera masculino o femenino
  sexoParaCalculo: string | null = null; // variable en caso de que el usuario se considera otro sexo 
  tipoCalculoGrasa: string | null = null;
  peso: number | null = null;
  altura: number | null = null;
  IMC: number | null = null;
  clasificacionIMC: string | null = null;
  cintura: number | null = null;
  cuello: number | null = null;
  cadera: number | null = null; // solo para mujeres
  PGC: number | null = null;
  clasificacionPGC: string | null = null;

  mostrarError = false;


  constructor(
    private clienteService: ClienteService,
    private antropometricosService: AntropometricosService
  ) { }

  buscarCliente() {
    const doc = (this.documentoBusqueda || '').trim();
    if (!doc) return;

    this.clienteService.buscarPorDocumento(doc).subscribe({
      next: (res) => {
        // 🔎 Normalizador: soporta varias formas de respuesta
        let cliente: any = null;

        if (Array.isArray(res)) {
          cliente = res.length ? res[0] : null;
        } else if (res && typeof res === 'object') {
          // casos comunes: {data:[...]}, {data:{...}}, {cliente:{...}}, {...}
          if (Array.isArray((res as any).data)) cliente = (res as any).data[0] || null;
          else if ((res as any).data && typeof (res as any).data === 'object') cliente = (res as any).data;
          else if ((res as any).cliente && typeof (res as any).cliente === 'object') cliente = (res as any).cliente;
          else cliente = res; // objeto plano
        }

        // ✅ Validación mínima
        if (!cliente || !cliente.ID_CLIENTE) {
          console.warn('Respuesta del backend no reconocida:', res);
          alert('❌ No se encontró ningún cliente con esa identificación.');
          return;
        }

        // ✅ Solo un cliente seleccionado (reemplaza)
        this.clientesSeleccionados = [cliente];

        // ✅ Toma los datos desde la tabla CLIENTE
        this.sexoSeleccionado = cliente.SEXO ?? 'Otro';
        this.fechaNacimiento = cliente.FECHA_NACIMIENTO ?? null;

        // ✅ Calcula edad
        this.calcularEdad();

        // Si sexo = 'otro', obliga a elegir sexoParaCalculo manual para fórmulas
        this.sexoParaCalculo = (this.sexoSeleccionado === 'Otro') ? null : this.sexoSeleccionado;

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
      (c) => c.ID_CLIENTE !== id);
    this.limpiarFormulario();
    ;
  }

  limpiarBusqueda() {
    // 🔹 Datos personales derivados
    this.fechaNacimiento = null;
    this.edadCalculada = null;
    this.sexoSeleccionado = null;
    this.sexoParaCalculo = null;
    this.tipoCalculoGrasa = null;

    // 🔹 Medidas antropométricas
    this.peso = null;
    this.altura = null;
    this.cintura = null;
    this.cuello = null;
    this.cadera = null;

    // 🔹 Resultados calculados
    this.IMC = null;
    this.clasificacionIMC = null;
    this.PGC = null;
    this.clasificacionPGC = null;
  }
  limpiarFormulario() {
    this.documentoBusqueda = '';
    this.clientesSeleccionados = [];
    this.limpiarBusqueda();
    this.mostrarError=false;
  }


  calcularEdad() {
    if (!this.fechaNacimiento) {
      this.edadCalculada = null;
      return;
    }

    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    this.edadCalculada = edad;
  }

  cambiarSexo(sexo: string) {
    this.sexoSeleccionado = sexo;
    if (sexo !== 'Otro') {
      this.tipoCalculoGrasa = null;
      this.sexoParaCalculo = sexo; // usar directamente para cálculo
    }
  }

  cambiarTipoCalculo(valor: string | null) {
    if (!valor) return;
    this.tipoCalculoGrasa = valor;
    this.sexoParaCalculo = valor;
    this.calcularPGC();
  }

  calculoIMC(peso: number, altura: number) {
    if (!peso || !altura || altura <= 0) return null;

    const alturaMetros = altura / 100;
    const imc = peso / (alturaMetros * alturaMetros);

    return parseFloat(imc.toFixed(1));
  }

  actualizarIMC() {
    if (!this.peso || !this.altura) {
      this.IMC = null;
      this.clasificacionIMC = null;
      return;
    }

    this.IMC = this.calculoIMC(this.peso, this.altura);
    this.clasificacionIMC = this.clasificarIMC(this.IMC);
    this.calcularPGC();
  }

  clasificarIMC(imc: number | null): string | null {
    if (imc === null) return null;

    if (imc < 18.5) return 'bajo';
    if (imc < 25) return 'normal';
    if (imc < 30) return 'sobrepeso';
    return 'obesidad';
  }

  calcularPGC() {
    if (!this.altura || !this.cintura || !this.cuello || !this.sexoParaCalculo) {
      this.PGC = null;
      this.clasificacionPGC = null;
      return;
    }

    const altura = this.altura;
    const cintura = this.cintura;
    const cuello = this.cuello;
    const cadera = this.cadera ?? 0;

    let porcentaje = null;
    const sexo = this.sexoParaCalculo.toLowerCase();

    if (sexo === 'masculino') {
      if (cintura <= cuello) return;

      porcentaje =
        495 /
        (1.0324 -
          0.19077 * Math.log10(cintura - cuello) +
          0.15456 * Math.log10(altura)) -
        450;

    } else if (sexo === 'femenino') {
      if (cintura + cadera <= cuello) return;

      porcentaje =
        495 /
        (1.29579 -
          0.35004 * Math.log10(cintura + cadera - cuello) +
          0.22100 * Math.log10(altura)) -
        450;
    }

    if (porcentaje !== null) {
      this.PGC = parseFloat(porcentaje.toFixed(1));
      this.clasificacionPGC = this.clasificarPGC(this.PGC);
    }
  }


  clasificarPGC(pgc: number | null): string | null {
    if (pgc === null || !this.sexoParaCalculo) return null;

    const s = this.sexoParaCalculo.toLowerCase();

    if (s === 'masculino') {
      if (pgc < 6) return 'bajo';
      if (pgc <= 17) return 'normal';
      if (pgc <= 24) return 'alto';
      return 'muy alto';
    } else {
      if (pgc < 14) return 'bajo';
      if (pgc <= 24) return 'normal';
      if (pgc <= 31) return 'alto';
      return 'muy alto';
    }
  }

  guardarDatos() {

    if (!this.clientesSeleccionados.length) {
      alert('⚠️ Debes seleccionar un cliente');
      this.mostrarError = true;
      return;
    }

    if (!this.peso || !this.altura ||!this.cuello ||!this.cintura) {
      alert('⚠️ Debes completar todos los campos');
      this.mostrarError = true;
      return;
    }


    if (!this.IMC || !this.PGC) {
      alert('⚠️ Calcula IMC y PGC antes de guardar');
      this.mostrarError = true;
      return;
    }

    const data = {
      cliente: this.clientesSeleccionados[0].ID_CLIENTE,
      usuario: localStorage.getItem('idUsuario'),
      peso: this.peso,
      altura: this.altura,
      pgc: this.PGC,
      imc: this.IMC,
      cuello: this.cuello,
      cintura: this.cintura,
      cadera: this.cadera ?? 0
    };

    this.antropometricosService.insertar(data).subscribe({
      next: (res) => {
        if (res.resultado === 'OK') {
          alert('✅ Datos registrados correctamente');
          this.limpiarFormulario();
        } else {
          alert('❌ Error: ' + res.mensaje);
        }
      },
      error: (err) => {
        console.error(err);
        alert('❌ No se pudo guardar el registro');
      }
    });

  }

  toggleError() {
    this.mostrarError = !this.mostrarError;
  }






}






