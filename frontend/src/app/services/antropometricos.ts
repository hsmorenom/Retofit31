import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AntropometricosService {
  private apiUrl = 'http://localhost:8000/backend/controlador/antropometricos.php';
  constructor(private http: HttpClient) { }

  // Aca se obtienen todos los registros de antropometricos
  // Observable es una clase que da aviso a datos que puedan tardar 
  consultar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  //aca se construye la url con el filtro segun el cliente, aca lo que se agrega al url es apiUrl+"?cliente=any" que este any puede ser cualquier id registrado en la db
  filtrarIdCliente(cliente: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?cliente=${cliente}`);
  }
  // se insertan nuevos registros a partir del api creado en backend
  insertar(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editar(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}?id=${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id=${id}`);
  }


}


