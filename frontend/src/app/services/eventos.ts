import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = 'http://localhost:8000/backend/controlador/eventos.php';

  constructor(private http: HttpClient) { }

  // Obtener todos los registros
  consultar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Filtrar segun prompt
  filtrar(filtro: string): Observable<any> {
    const params = new URLSearchParams();
    if (filtro && filtro.trim() !== '') {
      params.append('texto', filtro.trim());
    }

    return this.http.get(`${this.apiUrl}?${params.toString()}`);
  }


  // Insertar nuevo evento
  insertar(data: any): Observable<any> {
    const idUsuario = localStorage.getItem('idUsuario');
    const payload = { ...data, USUARIO: idUsuario };
    return this.http.post(this.apiUrl, payload);
  }


  // Editar evento por ID
  editar(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}?id=${id}`, data);
  }

  // Eliminar evento por ID
  eliminar(id: number): Observable<{ resultado: string; mensaje: string }> {
    return this.http.delete<{ resultado: string; mensaje: string }>(`${this.apiUrl}?id=${id}`);
  }

  consultarVigentes(): Observable<any> {
    return this.http.get(`${this.apiUrl}?vigentes=true`);
  }


}
