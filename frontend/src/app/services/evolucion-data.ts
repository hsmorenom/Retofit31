import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class Evolucion_dataService {
    datosSeleccionados: any[] = [];
    tipoDatoSeleccionado: string = '';
}
