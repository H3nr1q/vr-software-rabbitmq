import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment'; // Importe o ambiente

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private apiUrl = `${environment.apiUrl}/api/notificar`; // Use a variável de ambiente
  private socket: Socket;
  private statusUpdateSubject = new Subject<{ mensagemId: string, status: string }>();

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiUrl); // Use a variável de ambiente
    this.socket.on('statusUpdate', (data: { mensagemId: string, status: string }) => {
      this.statusUpdateSubject.next(data);
    });
  }

  enviarNotificacao(payload: { mensagemId: string, conteudoMensagem: string }): Observable<any> {
    return this.http.post(this.apiUrl, payload, { observe: 'response' });
  }

  getStatusUpdates(): Observable<{ mensagemId: string, status: string }> {
    return this.statusUpdateSubject.asObservable();
  }
}
