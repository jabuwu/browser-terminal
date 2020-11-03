import * as os from 'os';
import * as http from 'http';
import * as path from 'path';
import * as SocketIO from 'socket.io';
import * as pty from 'node-pty';
import express from 'express';

const app = express();
const server = http.createServer(app);
const io = SocketIO.listen(server);

app.use(express.static(path.join(process.cwd(), 'node_modules/socket.io-client/dist')));
app.use(express.static(path.join(process.cwd(), 'node_modules/xterm/lib')));
app.use(express.static(path.join(process.cwd(), 'node_modules/xterm/css')));
app.use(express.static(path.join(process.cwd(), 'node_modules/xterm-addon-fit/lib')));
app.use(express.static(path.join(process.cwd(), 'static')));

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const args: any[] = [];

io.on('connection', (socket) => {
  let ptyProcess = pty.spawn(shell, args, {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: (<any>process.env)
  });
  let ptyData = '';
  socket.emit('data', ptyData);
  socket.on('write', (data: string) => {
    ptyProcess.write(data);
  });
  socket.on('resize', (cols: number, rows: number) => {
    ptyProcess.resize(cols, rows);
  });
  ptyProcess.onData((e) => {
    ptyData += e;
    socket.emit('data', e);
  });
});

server.listen(8080, () => {
  console.log('Listening on port 8080!');
});