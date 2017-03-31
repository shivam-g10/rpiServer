var socketIo = require("socket.io-client");
var path = require("path");
var db = require(path.join(__dirname,"doa","db"));
var model = require(path.join(__dirname,"models","models"));
const log = require('simple-node-logger').createSimpleLogger('project.log');
var args = process.argv.slice(2);
var COL_HOUSE = "house"
var io = socketIo.connect("https://fyp-13bec0547.herokuapp.com/",{reconnect: true});
io.on("connect",(data)=>{
	console.log("connected");
});
io.on("connected",(data)=>{
	console.log("connected");
	if(data.connected){
		var onFind = function(err,data){
			if(err){
				log.info(err);
			}else{
				if(data){
					reconnect(data);
				}else{
					io.emit("init",{name:args.join(" ")});
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
		}
	}
	db.insert(data,onInsert);
});
io.on("success_connect",(data)=>{
console.log("success_connect");
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
					io.emit('sync',doc[0]);
				}
			};
			db.update(COL_HOUSE,{_id:doc[0]},doc[0],onUpdate);
		}
	};
	db.findAll(onFind);
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
function sync(data){
console.log("sync fun");
	io.emit('sync',data);
}
function reconnect(data){
console.log("reconnect fun");
	io.emit("reconnect",data);
}