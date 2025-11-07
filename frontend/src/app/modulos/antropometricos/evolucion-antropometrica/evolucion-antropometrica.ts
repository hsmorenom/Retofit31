import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Evolucion_dataService } from '../../../services/evolucion-data';
import annotationPlugin from 'chartjs-plugin-annotation';


Chart.register(...registerables, annotationPlugin);

@Component({
  selector: 'app-evolucion-antropometrica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evolucion-antropometrica.html'
})
export class EvolucionAntropometrica {

  registros: any[] = [];
  grafica: any;

  nombreCliente: string = '';
  nombreColumnaDato: string = '';
  tipoDatoSeleccionado: string = '';

  constructor(
    private evolucionDataService: Evolucion_dataService,
    private router: Router
  ) { }

  ngOnInit() {
    this.registros = this.evolucionDataService.datosSeleccionados;
    this.tipoDatoSeleccionado = this.evolucionDataService.tipoDatoSeleccionado;

    // ✅ Si no hay datos, no dibujamos nada todavía
    if (!this.registros || this.registros.length === 0) {
      return;
    }

    // ✅ Ahora sí podemos tomar info del cliente
    const r = this.registros[0];
    this.nombreCliente = `${r.NOMBRES ?? ''} ${r.APELLIDOS ?? ''}`.trim();


    const nombres: any = {
      PESO: "Peso corporal (Kg)",
      IMC: "Índice de masa corporal (IMC)",
      PGC: "Porcentaje de grasa corporal (%)",
      CUELLO: "Circunferencia de cuello (cm)",
      CINTURA: "Circunferencia de cintura (cm)",
      CADERA: "Circunferencia de cadera (cm)"
    };

    this.nombreColumnaDato = nombres[this.tipoDatoSeleccionado] ?? '';

    if (this.tipoDatoSeleccionado === 'PESO') {
      this.generarGraficaPeso();
    }

    if (this.tipoDatoSeleccionado === 'IMC') {
      this.generarGraficaIMC();
    }

    if (this.tipoDatoSeleccionado === 'PGC') {
      this.generarGraficaPGC();
    }

    if (this.tipoDatoSeleccionado === 'CUELLO') {
      this.generarGraficaCuello();
    }

    if (this.tipoDatoSeleccionado === 'CINTURA') {
      this.generarGraficaCintura();
    }

    if (this.tipoDatoSeleccionado === 'CADERA') {
      this.generarGraficaCadera();
    }

  }

  ngOnDestroy() {
    this.grafica?.destroy();
  }




  generarGraficaPeso() {
    const etiquetas = this.registros.map(r => {
      const partes = r.FECHA_REGISTRO.split("-");
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/mm/yyyy
    });

    const valores = this.registros.map(r => Number(r.PESO));

    const canvas: any = document.getElementById('graficaEvolucion');
    const ctx = canvas.getContext('2d');

    if (this.grafica) this.grafica.destroy();

    this.grafica = new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Peso (Kg)',
          data: valores,
          borderWidth: 3,
          borderColor: '#004D00',
          backgroundColor: 'rgba(124, 229, 79, 0.4)',
          pointBackgroundColor: '#004D00',
          pointBorderColor: '#004D00',
          tension: 0.3
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  }

  generarGraficaIMC() {
    const etiquetas = this.registros.map(r => {
      const partes = r.FECHA_REGISTRO.split("-");
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/mm/yyyy
    });

    const valores = this.registros.map(r => Number(r.IMC));

    const canvas: any = document.getElementById('graficaEvolucion');
    const ctx = canvas.getContext('2d');

    if (this.grafica) this.grafica.destroy();

    this.grafica = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Índice de masa corporal (IMC)',
          data: valores,
          borderWidth: 2,
          borderColor: '#004D00',
          backgroundColor: 'rgba(124, 229, 79, 0.6)',
          hoverBackgroundColor: '#004D00'
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'IMC'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Fecha'
            }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const imc: number = Number(context.raw);
                if (imc < 18.5) return `IMC: ${imc} (Bajo peso)`;
                if (imc < 25) return `IMC: ${imc} (Normal)`;
                if (imc < 30) return `IMC: ${imc} (Sobrepeso)`;
                return `IMC: ${imc} (Obesidad)`;
              }
            }
          },
          annotation: {
            annotations: {
              lineaNormal: {
                type: 'line',
                yMin: 25,
                yMax: 25,
                borderColor: '#004D00',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: 'IMC 25 (Límite Normal)',
                  position: 'end',
                  backgroundColor: '#004D00',
                  color: '#fff',
                  font: {
                    weight: 'bold',
                    size: 10
                  }
                }
              },
              lineaBajo: {
                type: 'line',
                yMin: 18.5,
                yMax: 18.5,
                borderColor: '#004D00',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: 'IMC 18.5 (Límite Bajo)',
                  position: 'end',
                  backgroundColor: '#004D00',
                  color: '#fff',
                  font: {
                    weight: 'bold',
                    size: 10
                  }
                }
              },
              lineaAlto: {
                type: 'line',
                yMin: 29.9,
                yMax: 29.9,
                borderColor: '#004D00',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: 'IMC 29.9 (Límite Sobrepeso)',
                  position: 'end',
                  backgroundColor: '#004D00',
                  color: '#fff',
                  font: {
                    weight: 'bold',
                    size: 10
                  }
                }
              }
            }
          }


        }
      }
    });
  }

  generarGraficaPGC() {
    const etiquetas = this.registros.map(r => {
      const partes = r.FECHA_REGISTRO.split("-");
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/mm/yyyy
    });

    const valores = this.registros.map(r => Number(r.PGC));

    const canvas: any = document.getElementById('graficaEvolucion');
    const ctx = canvas.getContext('2d');

    if (this.grafica) this.grafica.destroy();

    this.grafica = new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Porcentaje de grasa corporal (%)',
            data: valores,
            borderWidth: 3,
            borderColor: '#004D00',
            backgroundColor: 'rgba(124, 229, 79, 0.4)',
            pointBackgroundColor: '#004D00',
            pointBorderColor: '#004D00',
            tension: 0.3
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: '% Grasa corporal' }
          },
          x: {
            title: { display: true, text: 'Fecha de registro' }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const pgc: number = Number(context.raw);
                const sexo = this.registros[0].SEXO?.toLowerCase() ?? 'masculino';
                return `PGC: ${pgc}% (${this.clasificarPGC(pgc, sexo)})`;
              }
            }
          },
          annotation: {
            annotations: this.generarLineasReferenciaPGC() as any
          }
        }
      }
    });
  }

  clasificarPGC(pgc: number, sexo: string): string {
    if (sexo === 'masculino') {
      if (pgc < 6) return "Esencial";
      if (pgc < 14) return "Atleta";
      if (pgc < 18) return "Fitness";
      if (pgc < 25) return "Promedio";
      return "Obesidad";
    } else {
      if (pgc < 14) return "Esencial";
      if (pgc < 21) return "Atleta";
      if (pgc < 25) return "Fitness";
      if (pgc < 32) return "Promedio";
      return "Obesidad";
    }
  }

  generarLineasReferenciaPGC() {
    const sexo = this.registros[0].SEXO?.toLowerCase() ?? 'masculino';
    return sexo === 'masculino'
      ? {
        atleta: { type: 'line', yMin: 14, yMax: 14, borderColor: '#FFD700', borderWidth: 1, borderDash: [4, 4], label: { display: true, content: 'Atleta (14%)', position: 'end', backgroundColor: '#FFD700' } },
        fitness: { type: 'line', yMin: 18, yMax: 18, borderColor: '#32CD32', borderWidth: 1, borderDash: [4, 4], label: { display: true, content: 'Fitness (18%)', position: 'end', backgroundColor: '#32CD32' } },
        promedio: { type: 'line', yMin: 25, yMax: 25, borderColor: '#004D00', borderWidth: 1, borderDash: [4, 4], label: { display: true, content: 'Promedio (25%)', position: 'end', backgroundColor: '#004D00', color: '#fff' } }
      }
      : {
        atleta: { type: 'line', yMin: 21, yMax: 21, borderColor: '#FFD700', borderWidth: 1, borderDash: [4, 4], label: { display: true, content: 'Atleta (21%)', position: 'end', backgroundColor: '#FFD700' } },
        fitness: { type: 'line', yMin: 25, yMax: 25, borderColor: '#32CD32', borderWidth: 1, borderDash: [4, 4], label: { display: true, content: 'Fitness (25%)', position: 'end', backgroundColor: '#32CD32' } },
        promedio: { type: 'line', yMin: 32, yMax: 32, borderColor: '#004D00', borderWidth: 1, borderDash: [4, 4], label: { display: true, content: 'Promedio (32%)', position: 'end', backgroundColor: '#004D00', color: '#fff' } }
      };
  }

  generarGraficaCuello() {
    const etiquetas = this.registros.map(r => {
      const partes = r.FECHA_REGISTRO.split("-");
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/mm/yyyy
    });

    const valores = this.registros.map(r => Number(r.CUELLO));

    const canvas: any = document.getElementById('graficaEvolucion');
    const ctx = canvas.getContext('2d');

    if (this.grafica) this.grafica.destroy();

    this.grafica = new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Circunferencia de cuello (cm)',
            data: valores,
            borderWidth: 3,
            borderColor: '#004D00',
            backgroundColor: 'rgba(124, 229, 79, 0.4)',
            pointBackgroundColor: '#004D00',
            pointBorderColor: '#004D00',
            tension: 0.3
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: 'Medida (cm)' }
          },
          x: {
            title: { display: true, text: 'Fecha de registro' }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const cuello: number = Number(context.raw);
                return `Cuello: ${cuello.toFixed(1)} cm`;
              }
            }
          }
        }
      }
    });
  }

  generarGraficaCintura() {
    const etiquetas = this.registros.map(r => {
      const partes = r.FECHA_REGISTRO.split("-");
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/mm/yyyy
    });

    const valores = this.registros.map(r => Number(r.CINTURA));
    const sexo = this.registros[0].SEXO?.toLowerCase() ?? 'masculino';

    const canvas: any = document.getElementById('graficaEvolucion');
    const ctx = canvas.getContext('2d');

    if (this.grafica) this.grafica.destroy();

    this.grafica = new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Circunferencia de cintura (cm)',
            data: valores,
            borderWidth: 3,
            borderColor: '#004D00',
            backgroundColor: 'rgba(124, 229, 79, 0.4)',
            pointBackgroundColor: '#004D00',
            pointBorderColor: '#004D00',
            tension: 0.3
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: 'Medida (cm)' }
          },
          x: {
            title: { display: true, text: 'Fecha de registro' }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const cintura = Number(context.raw);
                const categoria = this.clasificarCintura(cintura, sexo);
                return `Cintura: ${cintura} cm (${categoria})`;
              }
            }
          },
          annotation: {
            annotations: this.generarLineasReferenciaCintura(sexo) as any
          }
        }
      }
    });
  }

  clasificarCintura(cintura: number, sexo: string): string {
    if (sexo === 'masculino') {
      if (cintura < 94) return 'Riesgo bajo';
      if (cintura < 102) return 'Riesgo moderado';
      return 'Riesgo alto';
    } else {
      if (cintura < 80) return 'Riesgo bajo';
      if (cintura < 88) return 'Riesgo moderado';
      return 'Riesgo alto';
    }
  }

  generarLineasReferenciaCintura(sexo: string): Record<string, any> {
    if (sexo === 'masculino') {
      return {
        moderado: {
          type: 'line', yMin: 94, yMax: 94, borderColor: '#FFD700', borderDash: [4, 4], borderWidth: 2,
          label: { display: true, content: '94 cm (Moderado)', backgroundColor: '#FFD700' }
        },
        alto: {
          type: 'line', yMin: 102, yMax: 102, borderColor: '#FF0000', borderDash: [4, 4], borderWidth: 2,
          label: { display: true, content: '102 cm (Alto)', backgroundColor: '#FF0000', color: '#fff' }
        }
      };
    } else {
      return {
        moderado: {
          type: 'line', yMin: 80, yMax: 80, borderColor: '#FFD700', borderDash: [4, 4], borderWidth: 2,
          label: { display: true, content: '80 cm (Moderado)', backgroundColor: '#FFD700' }
        },
        alto: {
          type: 'line', yMin: 88, yMax: 88, borderColor: '#FF0000', borderDash: [4, 4], borderWidth: 2,
          label: { display: true, content: '88 cm (Alto)', backgroundColor: '#FF0000', color: '#fff' }
        }
      };
    }
  }

  generarGraficaCadera() {
    const etiquetas = this.registros.map(r => {
      const partes = r.FECHA_REGISTRO.split("-");
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/mm/yyyy
    });

    const valores = this.registros.map(r => Number(r.CADERA));

    const canvas: any = document.getElementById('graficaEvolucion');
    const ctx = canvas.getContext('2d');

    if (this.grafica) this.grafica.destroy();

    this.grafica = new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Circunferencia de cadera (cm)',
            data: valores,
            borderWidth: 3,
            borderColor: '#004D00',
            backgroundColor: 'rgba(124, 229, 79, 0.4)',
            pointBackgroundColor: '#004D00',
            pointBorderColor: '#004D00',
            tension: 0.3
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: 'Medida (cm)' }
          },
          x: {
            title: { display: true, text: 'Fecha de registro' }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const cadera: number = Number(context.raw);
                return `Cadera: ${cadera.toFixed(1)} cm`;
              }
            }
          }
        }
      }
    });
  }


  exportarGrafica() {
    const enlace = document.createElement('a');
    enlace.href = this.grafica.toBase64Image();
    enlace.download = `Evolucion_Antropométrica_${new Date().getTime()}.png`;
    enlace.click();
  }

}
