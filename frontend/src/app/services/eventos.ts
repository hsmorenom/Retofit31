import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = environment.apiUrl + 'controlador/eventos.php';
  private apiQr = environment.apiApi + 'qr/generar-qr-individual.php';

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

  // Generar QR para un evento específico, se conecta con api de generar-qr aparte del modelo y controlador para respetar el funcionamiento del crud, es por ello que se usa una url diferente
  generarQR(idEvento: number): Observable<any> {
    return this.http.get(`${this.apiQr}?id_evento=${idEvento}`);
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
