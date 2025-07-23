import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { publishToQueue } from '../rabbit/producer.js';
import statusMap from '../statusMap.js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

router.post('/notificar', async (req, res) => {
  const { conteudoMensagem } = req.body;

  if (!conteudoMensagem || conteudoMensagem.trim() === '') {
    return res.status(400).json({ error: 'A mensagem não pode ser vazia.' });
  }

  const mensagemId = uuidv4();
  const payload = { mensagemId, conteudoMensagem };

  try {
    // Publica na fila
    await publishToQueue(process.env.QUEUE_IN, payload);

    // Define o status inicial como "AGUARDANDO"
    statusMap.set(mensagemId, 'AGUARDANDO PROCESSAMENTO');

    // Retorna a resposta imediatamente para o cliente
    res.status(202).json({ mensagemId, status: 'AGUARDANDO PROCESSAMENTO' });

  } catch (error) {
    console.error('[Produtor] Erro ao publicar na fila:', error.message);
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
});

export default router;
