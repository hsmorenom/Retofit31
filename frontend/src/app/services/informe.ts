import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InformeService {
  private apiUrl = 'http://localhost:8000/backend/controlador/informe.php';
  constructor(private http: HttpClient) { }

  //se obtienen todos los registro
  consultar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  // Filtrar usando cualquier campo (id, nombre_evento, usuario, etc.)
  filtrar(filtros: any): Observable<any> {
    // constructor que hace arma automaticamente la url
    // URLSearchParams convierte un objeto en un texto de url
    const parametros = new URLSearchParams();

    for (const key in filtros) {
      if (filtros[key] !== '' && filtros[key] !== null && filtros[key] !== undefined) {
        parametros.append(key, filtros[key]);
      }
    }

    return this.http.get(`${this.apiUrl}?${parametros.toString()}`);
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


