import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecordatorioService {
  private apiUrl = environment.apiUrl + 'controlador/recordatorio.php';
  private apiEnviar = environment.apiApi + 'correo/enviar-recordatorio.php';
  constructor(private http: HttpClient) { }

  //se obtienen todos los registro
  consultar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  consultarVigentes(): Observable<any> {
    return this.http.get(`${this.apiUrl}?tipo=vigencia`);
  }

  // se insertan nuevos registros a partir del api creado en backend
  insertar(data: any): Observable<{ resultado: string; mensaje: string }> {
    return this.http.post<{ resultado: string; mensaje: string }>(this.apiUrl, data);
  }

  //se edita registro existente segun id 
  editar(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}?id=${id}`, data);
  }
  //se elimina registro existente segun id
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id=${id}`);
  }

  enviarRecordatorio(
    correo: string,
    nombre: string,
    evento: any,
    tipo: string,
    telefono?: string
  ): Observable<{ resultado: string; mensaje: string; tipo?: string; sandbox?: boolean }> {
    const data: any = {
      tipo,
      nombre,
      evento
    };

    if (tipo === 'correo') {
      data.correo = correo;
    } else if (tipo === 'mensaje') {
      data.telefono = telefono;
    }

    return this.http.post<{ resultado: string; mensaje: string; tipo?: string; sandbox?: boolean }>(
      this.apiEnviar, data
    );
  }




  actualizarEstado(id: number, estado: string): Observable<any> {
    const url = `${this.apiUrl}?id=${id}&estado=${estado}`;
    return this.http.put(url, {});
  }







}


