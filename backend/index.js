import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import notifyRouter from './routes/notify.js';
import { startConsumer } from './rabbit/consumer.js';
import statusMap from './statusMap.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Configura o Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Em produção, restrinja para o seu domínio de frontend
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Passa a instância `io` para as rotas, se necessário
app.use('/api', notifyRouter); 

// Rota para verificar o status de uma mensagem
app.get('/api/status/:mensagemId', (req, res) => {
  const { mensagemId } = req.params;
  const status = statusMap.get(mensagemId) || 'NÃO ENCONTRADO';
  res.json({ mensagemId, status });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor principal rodando em http://localhost:${PORT}`);
  
  // Inicia o consumidor do RabbitMQ em segundo plano
  startConsumer(io).catch(err => {
    console.error('Falha ao iniciar o consumidor do RabbitMQ:', err.message);
  });
});

// Lógica do Socket.IO para quando um cliente se conectar
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});
