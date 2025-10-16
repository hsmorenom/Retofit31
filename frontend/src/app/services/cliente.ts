import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8000/backend/controlador/cliente.php';
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
  //se insertan los nuevos regustro a partir de la fusion entre cliente y usuario
  insertarClienteConUsuario(usuario: any, cliente: any): Observable<any> {
    return this.http.post(this.apiUrl, { usuario, cliente });
  }

  //se edita registro existente segun id 
  editar(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}?id=${id}`, data);
  }
  //se elimina registro existente segun id
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id=${id}`);
  }

  // ------------------SAUL------------------Administrativo //
  // Consultar Para modulo de Admin
  consultarParaAdmon(): Observable<any> {
    return this.http.get(`${this.apiUrl}?modo=admon`);
  }
  // Editar para Admon
  editarParaAdmon(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}?accion=editarParaAdmon&id=${id}`, data);
  }
  // Obtener cliente por ID_USUARIO
  obtenerClientePorUsuario(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?usuario=${idUsuario}`);
  }

  // Insertar como Admin
  insertarParaAdmon(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}?accion=insertarParaAdmon`, data);
  }

  //------------------SAUL-----------------Administrativo //
// Buscar cliente por número de documento
buscarPorDocumento(documento: string): Observable<any> {
  return this.http.get(`${this.apiUrl}?documento=${documento}`);
}



}


