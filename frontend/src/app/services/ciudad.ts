import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Ciudad {
  ID_CIUDAD: number;
  NOMBRE: string;
  DEPARTAMENTO: number;
}

@Injectable({
  providedIn: 'root'
})
export class CiudadService {
  private apiUrl = 'http://localhost:8000/backend/controlador/ciudad.php';
  constructor(private http: HttpClient) { }


  //se obtienen todos los registro
  consultar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  // se obtienen los registros que coincidan con el id
  filtrarPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?id=${id}`);
  }
  // se insertan nuevos registros a partir del api creado en backend
  insertar(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  //se edita registro existente segun id 
  editar(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}?id=${id}`, data);
  }
  //se elimina registro existente segun id
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id=${id}`);
  }


}


