const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Escuchar cuando se crea una nueva cita
    socket.on('newAppointment', (appointment) => {
      // Emitir a todos los barberos conectados
      socket.broadcast.emit('newAppointment', appointment);
    });

    // Escuchar cuando se actualiza una cita
    socket.on('appointmentUpdated', (appointment) => {
      // Emitir a todos los clientes
      socket.broadcast.emit('appointmentUpdate', appointment);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});