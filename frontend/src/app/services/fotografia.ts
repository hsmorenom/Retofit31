import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FotografiaService {
  private apiUrl = 'http://localhost:8000/backend/controlador/fotografia.php';

  constructor(private http: HttpClient) { }

  consultar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 🔎 Filtrar fotografías por cliente
  filtrar(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?id=${idCliente}`);
  }

  // ➕ Insertar fotografía nueva
  insertar(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // ✏️ Editar una fotografía existente
  editar(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}?accion=editar&id=${id}`, formData);
  }

  // 🗑️ Eliminar fotografía
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id=${id}`);
  }

  // ======================================================
  // ⬇⬇⬇ NUEVAS FUNCIONES PARA HISTORIAL DE PROGRESO ⬇⬇⬇
  // ======================================================

  // 1️⃣ OBTENER LAS 10 ÚLTIMAS FECHAS DE FOTOS
  obtenerFechasPorCliente(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}?accion=fechas&idCliente=${idCliente}`
    );
  }

  // 2️⃣ OBTENER FOTOS DE UNA FECHA ESPECÍFICA
  obtenerFotosPorFecha(idCliente: number, fecha: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}?accion=fotosPorFecha&idCliente=${idCliente}&fecha=${fecha}`
    );
  }

  // 3️⃣ GUARDAR OBSERVACIÓN (SOLO TEXTO)
  guardarObservacion(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}?accion=guardarObservacion`,
      data
    );
  }
}
