var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var usuarios = [];
var conectados = [];
var colores = ['#32948A', '#F27405', '#B23203', '#793F52', '#FF523B', '#99C40A', '#C88900', '#363D9B', '#673B7E', '#1CB9D5', '#846600', '#DDCC0B', '#D9006A', '#19A901', '#034402', '#FE0303', '#BA33DC', '#544759', '#A197A6'];
function updateConnected(sock, conected){
  io.emit('conectados', conectados.sort());
}
io.on('connection', function(socket){
  socket.on('nick', function(datos, callbk){
    var i = 0;
    var objeto = {};
    objeto.band = false;
    objeto.dat = datos;
    while(i < conectados.length){
      if (conectados[i] == datos.name){
        objeto.band = true;
        console.log('Esta ingresando 2 veces');
        break;
      }
      i++;
    }
    if (objeto.band){
      callbk(objeto);
    }else{
      socket.usuario = datos.name;
      socket.usuarioId = datos.id;
      socket.usuarioFoto = datos.picture;
      socket.usuarioColor = colores[Math.floor(Math.random() * colores.length)];
      usuarios.push(socket);
      conectados.push(socket.usuario);
      socket.broadcast.emit('ingreso', socket.usuario + " acaba de ingresar");
      updateConnected(socket, conectados);
      console.log(socket.usuario + ' se ha conectado. %d conectados', usuarios.length);
      callbk(objeto);
    }
    
  });
  socket.on('disconnect', function(){
    if (socket.usuario !== undefined){
      conectados.splice(conectados.indexOf(socket.usuario), 1);
      usuarios.splice(socket, 1);
      socket.broadcast.emit('salida', socket.usuario + ' acaba de salir');
      updateConnected(socket, conectados);
      console.log(socket.usuario + ' se ha desconectado. %d conectados', usuarios.length);
    }else{
      console.log('Alguien refrescó el navegador');
    }
  });
  socket.on('chat message', function(msg){
    socket.broadcast.emit('chat message', {usuario: socket.usuario, mensaje: msg, color: socket.usuarioColor, foto : socket.usuarioFoto});
  });
  socket.on('escribiendo', function(escribiendo){
    socket.broadcast.emit('escribiendo', {quien: socket.usuario, esc: escribiendo});
  });

});

http.listen(3000, function(){
  console.log('Chat server initialized');
});