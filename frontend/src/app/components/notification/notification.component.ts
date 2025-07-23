import { Component, OnInit, OnDestroy } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { NotificacaoService } from '../../services/notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  conteudoMensagem = '';
  notificacoes: { mensagemId: string, status: string }[] = [];
  private statusSubscription: Subscription | undefined;

  constructor(private notificacaoService: NotificacaoService) { }

  ngOnInit(): void {
    this.statusSubscription = this.notificacaoService.getStatusUpdates().subscribe(update => {
      console.log('WebSocket update received:', update);
      const index = this.notificacoes.findIndex(n => n.mensagemId === update.mensagemId);
      console.log('Found index:', index);
      if (index !== -1) {
        this.notificacoes[index] = { ...this.notificacoes[index], status: update.status };
        console.log('Notification updated:', this.notificacoes[index]);
      } else {
        console.log('Notification not found in array for ID:', update.mensagemId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  enviar() {
    if (!this.conteudoMensagem.trim()) return;

    const mensagemId = uuidv4();

    this.notificacaoService.enviarNotificacao({
      mensagemId,
      conteudoMensagem: this.conteudoMensagem
    }).subscribe(response => {
      if (response.status === 202) {
        const confirmedMensagemId = response.body?.mensagemId || mensagemId;
        this.notificacoes.unshift({
          mensagemId: confirmedMensagemId,
          status: 'AGUARDANDO PROCESSAMENTO'
        });
        this.conteudoMensagem = '';
      }
    });
  }
}
