import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Evolucion_dataService {
    datosSeleccionados: any[] = [];
    tipoDatoSeleccionado: string = '';
}
