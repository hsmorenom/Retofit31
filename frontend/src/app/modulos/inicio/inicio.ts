import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Tipo_usuarioService } from '../../services/tipo-usuario';
import { UsuarioService } from '../../services/usuario';
import { ClienteService } from '../../services/cliente';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html'
})
export class Inicio implements AfterViewInit, OnInit {
  nombreCompleto: string = '';
  tipoUsuario: string = '';

  constructor(
    private tipo_usuarioService: Tipo_usuarioService,
    private usuarioService: UsuarioService,
    private clienteService: ClienteService
  ) { }

  ngOnInit(): void {
    const idUsuario = localStorage.getItem('idUsuario');

    if (idUsuario) {
      this.usuarioService.filtrarPorId(+idUsuario).subscribe((data) => {
        console.log('Respuesta del backend:', data);
        this.nombreCompleto = `${data.PRIMER_NOMBRE } ${data.SEGUNDO_NOMBRE ||''} ${data.PRIMER_APELLIDO} ${data.SEGUNDO_APELLIDO ||''}`;
        this.tipoUsuario = data.TIPO_USUARIO;
      });
    }
    

    console.log('ID recuperado:', localStorage.getItem('idUsuario'));

  }

  ngAfterViewInit(): void {
    this.cargarGraficas();
  }

  cargarGraficas() {
    new Chart('asistenciaChart', {
      type: 'line',
      data: {
        labels: ['Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Asistencias',
          data: [75, 100, 95, 110, 140],
          backgroundColor: 'rgba(34,197,94,0.2)',
          borderColor: 'rgba(34,197,94,1)',
          fill: true,
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 3,

      }
    });

    new Chart('antropometricaChart', {
      type: 'radar',
      data: {
        labels: ['Peso', 'Circunferencia cuello', 'IMC', 'PGC'],
        datasets: [{
          label: 'Datos',
          data: [65, 35, 22, 15],
          backgroundColor: 'rgba(34,197,94,0.2)',
          borderColor: 'rgba(34,197,94,1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 3
      }
    });

    new Chart('financieroChart', {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr'],
        datasets: [{
          label: 'Recaudo',
          data: [1000000, 1200000, 1100000, 1250000],
          backgroundColor: 'rgba(34,197,94,0.7)'
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 3,
      }
    });
  }
}
