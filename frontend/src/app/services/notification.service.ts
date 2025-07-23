import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private apiUrl = 'http://localhost:3000/api/notificar';

  constructor(private http: HttpClient) { }

  enviarNotificacao(payload: { mensagemId: string, conteudoMensagem: string }): Observable<any> {
    return this.http.post(this.apiUrl, payload, { observe: 'response' });
  }
}
