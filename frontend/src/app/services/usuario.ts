import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8000/backend/controlador/usuario.php';
  constructor(private http: HttpClient) { }

  //se obtienen todos los registro
  consultar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  // se obtienen los registros que coincidan con el id
  filtrarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?id=${id}`);
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

  login(data: { email: string, clave: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  validarClave(id: number, clavePlano: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?id=${id}&clave=${encodeURIComponent(clavePlano)}`);
  }

  cambiarClave(id: number, claveActual: string, nuevaClave: string): Observable<any> {
    return this.http.put(`${this.apiUrl}?id=${id}`, { claveActual, nuevaClave });
  }

  //  Cambiar estado de cliente (ACTIVO/INACTIVO)
  cambiarEstado(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}?accion=cambiarEstado`, { id });
  }
  //------------------SAUL-----------------Administrativo //


  enviarCorreoRecuperacion(email: string) {
    const url = `http://localhost:8000/backend/api/correo/enviar-recuperacion.php`;

    return this.http.post<any>(url, { correo: email });
  }


  verificarToken(token: string) {
    const url = `http://localhost:8000/backend/api/correo/verificar-token.php`;
    return this.http.get<any>(`${url}/verificar-token.php?token=${token}`);
  }


  actualizarClaveDesdeToken(token: string, nuevaClave: string) {
  const url = `${this.apiUrl}?accion=actualizarDesdeToken`;

  return this.http.post<any>(url, {
    token: token,
    claveNueva: nuevaClave
  });
}


}


