import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FotografiaService {
  private apiUrl = 'http://localhost:8000/backend/controlador/fotografia.php';

  constructor(private http: HttpClient) { }

  // ⏺ Consultar todas las fotografías
  consultar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // 🔎 Filtrar fotografías por ID cliente
  filtrar(idCliente: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?id=${idCliente}`);
  }

  // ➕ Insertar fotografía nueva (AJUSTADO PARA FORM DATA)
  insertar(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // ✏️ Editar una fotografía existente
  editar(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}?id=${id}`, formData);
  }

  // 🗑️ Eliminar fotografía
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id=${id}`);
  }

  
}
