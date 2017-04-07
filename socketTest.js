var socketIo = require("socket.io-client");
var path = require("path");
var db = require(path.join(__dirname,"doa","db"));
var model = require(path.join(__dirname,"models","models"));
var request = require('request');
const log = require('simple-node-logger').createSimpleLogger('project.log');
//var args = process.argv.slice(1);
var COL_HOUSE = "house"
var io = socketIo.connect("http://fyp-13bec0547.herokuapp.com/",{reconnect: true});
io.on("connect",(data)=>{
	console.log("connected");
});
io.on("connected",(data)=>{
	console.log("connected");
	if(data.connected){
		var onFind = function(err,d){
			if(err){
				log.info(err);
			}else{
				console.log(d);
				if(d.length!=0){
					reconnect(d[0]);
				}else{
					io.emit("init",{name:"somename"});
				}
			}
		}
		db.findAll(COL_HOUSE,onFind);
	}
});
io.on("success_init",(data)=>{
console.log("succes_init");
	var onInsert = function(err,doc){
		if(err){
			log.info(err);
		}else{
			log.info("Inserted doc : " + JSON.stringify(doc));
			reconnect(doc.ops[0]);
		}
	}
	db.insert(COL_HOUSE,data,onInsert);
});
io.on("success_connect",(data)=>{
console.log("success_connect");
console.log(data.reconnect);
	if(!data.reconnect){
		var onFind = function(err,doc){
			if(err){
				log.info(err);
			}else{
				doc[0].connected = true;
				doc[0].modified = model.getDateTime();
				var onUpdate = function(err,d){
					if(err){
						log.info(err);
					}else{
						sync(doc[0]);
					}
				};
				db.update(COL_HOUSE,{_id:doc[0]._id},doc[0],onUpdate);
			}
		};
		db.findAll(COL_HOUSE,onFind);
	}
});
io.on('success_sync',(data)=>{
console.log("success_sync");
	if(!data.reconnect){
		var onFind = function(err,doc){
			if(err){
				log.info(err);
			}else{
				doc[0].sync = true;
				doc[0].modified = model.getDateTime();
				var onUpdate = function(err,d){
					if(err){
						log.info(err);
					}else{
						io.emit('acknowledge',{time:model.getDateTime()});
					}
				};
				db.update(COL_HOUSE,{_id:doc[0]._id},doc[0],onUpdate);
			}
		};
		db.findAll(COL_HOUSE,onFind);
	}
});
io.on('need_sync',(data)=>{
console.log("need_sync");
	var onFind = function(err,doc){
		if(err){
			log.info(err);
		}else{
			doc[0].tasks = data.tasks;
			doc[0].modified = model.getDateTime();
			var onUpdate = function(err,d){
				if(err){
					log.info(err);
				}else{
					io.emit('rpiSync',doc[0]);
				}
			};
			db.update(COL_HOUSE,{_id:doc[0]},doc[0],onUpdate);
		}
	};
	db.findAll(COL_HOUSE,onFind);
});
io.on('turnOff',(data)=>{
	console.log("turnOff");
	if(data.house){
		var house = data.house;
		var controller = data.controller;
				request.get("http://192.168.43.237/"+house.controllers[controller]._id+"Off",(err,response,body)=>{
					if(err){
						console.log(err);
					}else{
						console.log(response.statusCode);
						console.log(body);
						db.update(COL_HOUSE,{_id:house._id},house,(err)=>{if(err){console.log(err);}});
					}
				});
			
	}
});
io.on('turnOn',(data)=>{
	console.log("turnOn");
	if(data.house){
		var house = data.house;
		var controller = data.controller;
		
				request.get("http://192.168.43.237/"+house.controllers[controller]._id+"On",(err,response,body)=>{
					if(err){
						console.log(err);
					}else{
						console.log(response.statusCode);
						console.log(body);
						db.update(COL_HOUSE,{_id:house._id},house,(err)=>{if(err){console.log(err);}});
					}
				});
			
	}
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

io.on('error',(data)=>{
	console.log("error");
	console.log(data);
});
function sync(data){
console.log("sync fun");
	io.emit('rpiSync',data);
}
function reconnect(data){
console.log("reconnect fun");
console.log(data);
	io.emit("rpiReconnect",data);
}
