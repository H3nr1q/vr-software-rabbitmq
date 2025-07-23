import { Component } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { NotificacaoService } from '../../services/notification.service';


@Component({
  selector: 'app-notificacao',
  templateUrl: './notificacao.component.html',
  styleUrls: ['./notificacao.component.scss']
})
export class NotificacaoComponent {
  conteudoMensagem = '';
  notificacoes: { mensagemId: string, status: string }[] = [];

  constructor(private notificacaoService: NotificacaoService) { }

  enviar() {
    if (!this.conteudoMensagem.trim()) return;

    const mensagemId = uuidv4();

    this.notificacaoService.enviarNotificacao({
      mensagemId,
      conteudoMensagem: this.conteudoMensagem
    }).subscribe(response => {
      if (response.status === 202) {
        this.notificacoes.unshift({
          mensagemId,
          status: 'AGUARDANDO PROCESSAMENTO'
        });
        this.conteudoMensagem = '';
      }
    });
  }
}
