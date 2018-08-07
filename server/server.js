const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {generateMessage,generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  
  // socket.emit('newMessage', {
    // from: 'Arvind',
    // text: 'See you then',
    // createdAt: 123123
  // });
  
  // socket.emit('newMessage', {
    // from: 'Admin',
    // text: 'Welcome to the chat app',
    // createdAt: new Date().getTime()
  // });
  
  //socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
  
  //socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));
  
  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      callback('Name and room name are required.');
    }
	socket.join(params.room);
	users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
	 io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    // socket.leave('The Office Fans');

    // io.emit -> io.to('The Office Fans').emit
    // socket.broadcast.emit -> socket.broadcast.to('The Office Fans').emit
    // socket.emit
	socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));

    callback();
  });
  
  // socket.broadcast.emit('newMessage', {
    // from: 'Arvind',
    // text: 'New user joined',
    // createdAt: new Date().getTime()
  // });
  
  socket.on('createMessage', (message, callback) => {
    //console.log('createMessage', message);
	
	var user = users.getUser(socket.id);
	 if (user && isRealString(message.text)) {
	 //io.emit('newMessage', generateMessage(message.from, message.text));
	 io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
	 }
	 callback();
    // io.emit('newMessage', {
      // from: message.from,
      // text: message.text,
      // createdAt: new Date().getTime()
    });
	
	socket.on('createLocationMessage', (coords) => {
    //io.emit('newMessage', generateMessage('Admin', `${coords.latitude}, ${coords.longitude}`));
	//io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
	
	var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
    }
  });
	
	// socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });
  //});
  
  
  // socket.emit('newEmail', {
    // from: 'mike@example.com',
    // text: 'Hey. What is going on.',
    // createAt: 123
  // });
   // socket.on('createMessage', (message) => {
    // console.log('createMessage', message);
  // });

  // socket.on('createEmail', (newEmail) => {
    // console.log('createEmail', newEmail);
  // });

  socket.on('disconnect', () => {
    //console.log('User was disconnected');
	var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
  });


server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});





