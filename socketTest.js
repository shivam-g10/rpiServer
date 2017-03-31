var socketIo = require("socket.io-client");
var io = socketIo.connect("https://fyp-13bec0547.herokuapp.com/",{reconnect: true});
io.on("connect",(data)=>{
	console.log("connected" + data);
});
io.on("connected",(data)=>{
	console.log(data);
	io.emit("init",{name:"test"});
});
io.on("sucess_init",(data)=>{
	console.log("sucess_init");
	console.log(data);
});
io.on("error_db",(data)=>{
	console.log("error_db");
	console.log(data);
});
io.on("error_init",(data)=>{
	console.log("error_init");
	console.log(data);
});
io.on("error_find",(data)=>{
	console.log("error_find");
	console.log(data);
});
io.on("error_data",(data)=>{
	console.log("error_data");
	console.log(data);
});
io.on("error_update",(data)=>{
	console.log("error_update");
	console.log(data);
});