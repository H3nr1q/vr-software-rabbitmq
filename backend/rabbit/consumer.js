import amqp from 'amqplib';
import { updateStatus, getStatus } from '../statusMap.js';
import dotenv from 'dotenv';
dotenv.config();

export async function startConsumer(io) {
  try {
    // 1. Conecta ao RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    console.log('[Consumer] Consumidor conectado ao RabbitMQ');

    // 2. Declara as filas (usando variáveis de ambiente)
    const queueIn = process.env.QUEUE_IN;  // fila.notificacao.entrada.[SEU-NOME]
    const queueOut = process.env.QUEUE_OUT; // fila.notificacao.status.[SEU-NOME]

    await channel.assertQueue(queueIn, { durable: false });
    await channel.assertQueue(queueOut, { durable: false });

    // 3. Configura o consumidor
    channel.consume(queueIn, async (msg) => {
      if (msg) {
        const { mensagemId, conteudoMensagem } = JSON.parse(msg.content.toString());

        // Atualiza status para PROCESSANDO
        updateStatus(mensagemId, 'PROCESSANDO');
        io.emit('statusUpdate', { mensagemId, status: 'PROCESSANDO' });

        try {
          // 4. Simula processamento (1-2 segundos) - REQUISITO
          await new Promise(resolve =>
            setTimeout(resolve, 1000 + Math.random() * 1000));

          // 5. Gera resultado aleatório (20% falha) - REQUISITO
          const randomNum = Math.floor(Math.random() * 10) + 1;
          const status = randomNum <= 2
            ? 'FALHA_PROCESSAMENTO'
            : 'PROCESSADO_SUCESSO';

          // 6. Atualiza status e publica na fila de status - REQUISITO
          updateStatus(mensagemId, status);
          channel.sendToQueue(
            queueOut,
            Buffer.from(JSON.stringify({ mensagemId, status }))
          );

          // 7. Notifica via Socket.IO
          io.emit('statusUpdate', { mensagemId, status });

          console.log(`[Consumer] Mensagem ${mensagemId} processada: ${status}`);
          channel.ack(msg);

        } catch (err) {
          console.error(`[Consumer] Erro ao processar ${mensagemId}:`, err);
          channel.nack(msg);
        }
      }
    });

  } catch (error) {
    console.error('[Consumer] Erro no consumidor:', error.message);
    process.exit(1); // Encerra o processo em caso de erro crítico
  }
}