////
////
////
const express=require('express');
var app=require('express')(),
    bodyparser=require('body-parser'),
	http=require('http').Server(app),
    jsonfile=require('jsonfile'),
    path=require('path');

global.io=require('socket.io')(http);

io.set('heartbeat timeout', 4000); 
io.set('heartbeat interval', 2000);

//using function java
var usersControler=require('./Contoroler/userscontroler');
var socketControler=require('./Contoroler/socketcontroler');
var productControler=require('./Contoroler/productControler');
var orderControler=require('./Contoroler/orderControler');
var recommenderSystem=require('./Contoroler/recommenderSystem');
var newsControler=require('./Contoroler/newsControler');



//config express js
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());



//for test runin server
app.get('',function(req,res){
	
	res.end("darkhaste get ferestade shode ast");
});

//nahveye morefi kardane file static be express
app.use('/Data', express.static(__dirname + '/Data'));


//user endpoint
app.post('/signup',usersControler.signUpNewUser);
app.post('/verifiedNewUser',usersControler.verifiedNewUser);
app.post('/signin',usersControler.signIn);


//socket endpoint
io.sockets.on('connection',socketControler.SocketLogin);
io.sockets.on('connection',productControler.SocketLogin);
io.sockets.on('connection',orderControler.SocketLogin);
io.sockets.on('connection',recommenderSystem.SocketLogin);
io.sockets.on('connection',newsControler.SocketLogin);




http.listen(3000,function () {

    console.log("server listen on port 3000");

});