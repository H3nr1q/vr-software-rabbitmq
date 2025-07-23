import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

let channel = null;

async function connectRabbitMQ() {
  if (channel) {
    return;
  }
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('[Produtor] Conectado ao RabbitMQ');
  } catch (error) {
    console.error('[Produtor] Falha ao conectar com o RabbitMQ:', error.message);
    // Encerra o processo se não conseguir conectar, pois o producer é essencial
    process.exit(1);
  }
}

export async function publishToQueue(queue, message) {
  if (!channel) {
    await connectRabbitMQ();
  }
  try {
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`[Produtor] Mensagem enviada para a fila ${queue}:`, message);
  } catch (error) {
    console.error(`[Produtor] Erro ao enviar para a fila ${queue}:`, error.message);
  }
}

// Conecta ao iniciar a aplicação
connectRabbitMQ();
