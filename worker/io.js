var path = require('path');
	var LOG = require('log');
	var log  = new LOG();
	var MongoApi = require(path.join(__dirname+"/../db/db"));
	var model = require(path.join(__dirname+"/../models/models"));
	var socketio  = require('socket.io');
	
	var currentConnections  = {};
	var mapRpiToSocket  = {};
	/* GET home page. */
	var server = null;
	var io = null;

class SocketIO{

	constructor(s){
		server = s;

		io = socketio(server);
		io.on('connection',(socket)=>{
			socket.emit('connected',{connected: true});
			socket.on('init',(data)=>{
				let onConnect = (err,db)=>{
					if(err){
						log.error(err);
						socket.emit("error_db",{reconnect:true});
					}else{
						let collection = db.collection("house_hold");
						let house = model.HouseHold;
						house._id = model.newObjectId();
						house.created = model.getDateTime();
						house.modified = model.getDateTime();
						house.name = data.name;
						let ctrl1 = {};
						ctrl1._id = "socket1";
						ctrl1.name= ctrl1._id;
						ctrl1.status = false;
						ctrl1.modified = model.getDateTime();
						ctrl1.created = model.getDateTime();
						console.log("ctrl1 : " + JSON.stringify(ctrl1));
						house.controllers.push(ctrl1);
						console.log("house 1 : " + JSON.stringify(house));
						let ctrl2 ={};
						ctrl2._id = "socket2";
						ctrl2.name= ctrl2._id;
						ctrl2.status = false;
						ctrl2.modified = model.getDateTime();
						ctrl2.created = model.getDateTime();
						console.log(JSON.stringify(house));
						console.log("ctrl2 : " + JSON.stringify(ctrl2));
						house.controllers.push(ctrl2);
						
						console.log("house 2 : " + JSON.stringify(house));
						collection.insert(house,(err,doc)=>{
							if(err){	
								log.error(err);
								socket.emit("error_init",{reconnect:true});
							}else{
								log.info("Init : " + house._id);
								socket.emit("success_init",house);
							}
							db.close();
						});
					}
				};
				MongoApi.connect(onConnect);
			});
			socket.on('rpiReconnect',(data)=>{
				if(data._id){
					console.log(data);
					let onConnect = (err,db)=>{
						if(err){
							log.error(err);
							socket.emit("error_db",{reconnect:true});
						}else{
							let collection = db.collection("house_hold");
							collection.findOne({_id:data._id},(err,doc)=>{
								if(err){
									log.error(err);
									socket.emit("error_find",{reconnect:true});
									db.close();
								}else{
									if(doc){
										doc.connected = true;
										doc.modified = model.getDateTime();
										collection.update({_id:data._id},doc,(err,d)=>{
											if(err){
												log.error(err);
												socket.emit("error_update",{reconnect:true});
											}else{
												currentConnections[socket.id] = data._id;
												mapRpiToSocket[data._id] = socket.id;
												log.info("connected : " + data._id);
												socket.emit('success_connect',{reconnect:false});
											}
											db.close();
										});
									}else{
										log.error("Not found : "+ data._id);
										socket.emit("error",{reconnect:true});	
										db.close();
									}
								}
							});
							
						}
					};
					MongoApi.connect(onConnect);
				}else{
					socket.emit("error_data",{reconnect:true});
				}
			});
			socket.on('rpiSync',(data)=>{
				console.log("test//////////////////////////////" + JSON.stringify(data));
				if(data.modified){
					MongoApi.connect((err,db)=>{
						if(err){
							log.error(err);
							socket.emit("error_db",{reconnect:true});
						}else{
							let collection = db.collection("house_hold");
							collection.findOne({_id:data._id},(err,doc)=>{
								if(err){
									log.error(err);
									socket.emit("error_find");
									db.close();
								}else{
									if(doc){
										var rpiDate = new Date(data.modified);
										var serverDate = new Date(doc.modified);
										if(rpiDate>serverDate){
											doc.controllers = data.controllers;
											doc.tasks = data.tasks;
											doc.sync = true;
											doc.modified = model.getDateTime();
											collection.update({_id:doc._id},doc,(err,d)=>{
												if(err){
													log.error(err);
													socket.emit("error_update",{reconnect:true});
												}else{
													currentConnections[socket.id] = data._id;
													log.info("Synced : " + data._id);
													socket.emit('success_sync',{reconnect:false});
												}
												db.close();
											});
										}else{
											socket.emit('need_sync',doc);
										}
									}else{
										log.error("Not found : "+ data._id);
										socket.emit("error",{reconnect:true});	
										db.close();
									}
								}
							});
						}
					});
				}else{
					socket.emit("error_data",{reconnect:true});
				}
			});
			socket.on("disconnect",(data)=>{
				MongoApi.connect((err,db)=>{
					if(err){
						log.error(err);
					}else{
						let collection = db.collection("house_hold");
						let id = currentConnections[socket.id];
						collection.findOne({_id:id},(err,doc)=>{
							if(err){
								log.error(err);
								db.close();
							}else{
								if(doc){
									doc.connected = false;
									doc.modified = model.getDateTime;
									doc.connected = false;
									doc.sync = false;
									collection.update({_id:id},doc,(err,d)=>{
										if(err){
											log.error(err);
										}else{
											delete mapRpiToSocket[currentConnections[socket.id]];
											delete currentConnections[socket.id];										
										}
										db.close();
									});
								}
							}
						});
					}
				});
			});
			socket.on('acknowledge',(data)=>{
				log.info("Updated : " + data );
			});
		});
	}
};

SocketIO.turnOn = (house,controller)=>{
	console.log(JSON.stringify(house));
	console.log(controller);
	console.log(mapRpiToSocket);
	if(mapRpiToSocket[house._id]){
		MongoApi.connect((err,db)=>{
			if(err){
				log.error(err);
				return null;
			}else{
				var col = db.collection("house_hold");
				col.findOne({_id:house._id},(err,doc)=>{
					if(err){
						log.error(err);
						db.close();
						return null;
					}else{
							house.controllers[controller].status = true;
							house.controllers[controller].modified = model.getDateTime();
							house.modified = model.getDateTime();
							db.collection("house_hold").update({_id:house._id},house,(err)=>{
								if(err){
									log.error(err);
									return null;
								}else{
									io.to(mapRpiToSocket[house._id]).emit("turnOn",{house:house,controller:controller});
									return true;
								}
								db.close();
							});
					}
				});
			}
		});
		
	}else{
		return false;
	}
};

SocketIO.turnOff = (house,controller)=>{
	if(mapRpiToSocket[house._id]){
		MongoApi.connect((err,db)=>{
			if(err){
				log.error(err);
				return null;
			}else{
				var col = db.collection("house_hold");
				col.findOne({_id:house._id},(err,doc)=>{
					if(err){
						log.error(err);
						db.close();
						return null;
					}else{
							house.controllers[controller].status = false;
							house.controllers[controller].modified = model.getDateTime();
							house.modified = model.getDateTime();
							db.collection("house_hold").update({_id:house._id},house,(err)=>{
								if(err){
									log.error(err);
									return null;
								}else{
									io.to(mapRpiToSocket[house._id]).emit("turnOff",{house:house,controller:controller});
									return true;
								}
								db.close();
							});
					}
				});
			}
		});
		
	}else{
		return false;
	}
};
module.exports = SocketIO;
