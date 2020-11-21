var PORT = process.env.PORT || 8080;
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const RpsGame = require('./rps-game');

const app = express();

const clientPath = `${__dirname}/client`
console.log(`Serving static from ${clientPath}`)

app.use(express.static(clientPath))

const server = http.createServer(app);

const io = socketio(server);

let waitingPlayer = null;

io.on('connection', (sock) => {

    if (waitingPlayer) {
        // start game
        io.emit('askName'); // on demande leurs noms aux joueurs
        new RpsGame(waitingPlayer, sock);
        waitingPlayer = null;
    } else {
        waitingPlayer = sock;
        waitingPlayer.emit('message', "waiting for an opponent");
    }

    sock.on('message', (text) => {
        io.emit('message', text); // io.emit envoie a tous les clients
    })

    
})
server.on('error', (err) => {
    console.error('server error : ', err)
})

server.listen(PORT, () => {
    console.log('rps started')
})