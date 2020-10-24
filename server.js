var ioServer = require('socket.io')
var fs = require("fs")
var httpsServer = require('https').createServer(
    {
        key: fs.readFileSync('/home/ubuntu/chat/server.key'),
        cert: fs.readFileSync('/home/ubuntu/chat/server.crt')
    }
);
var io = new ioServer();
io.attach(httpsServer);
httpsServer.listen(4444);

io.set('log level', 1);

var usrtab = {}

io.sockets.on('connection', function (socket) {
    

	var ID = (socket.id).toString().substr(0, 5);
	var time = (new Date).toLocaleTimeString();

	socket.on('new_user', function (msg) {
		usrtab[socket.id.toString()] = msg
		socket.broadcast.emit('new_user',usrtab[socket.id.toString()]);
	})
	
	socket.on('message', function (msg) {
		if ( usrtab[socket.id.toString()] )
			io.emit("message",{name: usrtab[socket.id.toString()].name, text: msg, avatar_url: usrtab[socket.id.toString()].avatar_url});
	});

	socket.on('disconnect', function() {
		io.emit("disconnect",usrtab[socket.id.toString()])
		delete usrtab[socket.id.toString()];
	});

	socket.on('get_online', function() {
		socket.emit('get_online',Object.keys(usrtab).length)
	})
});