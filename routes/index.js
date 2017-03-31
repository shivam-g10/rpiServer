var express = require('express');
var request = require('request');
var path = require('path');
var LOG = require('log');
var log  = new LOG();
var router = express.Router();
var MongoApi = require(path.join(__dirname+"/../db/db"));
var model = require(path.join(__dirname+"/../models/models"));
var io = require('socket.io')(server);
var currentConnections  = {};
/* GET home page. */
router.get('/', function(req, res, next) {
	let onConnect = (err,db)=>{
		if(err){
			log.error(err);
			res.send("Error connecting to database");
		}else{
			let collection = db.collection("house_hold");
			collection.find().toArray().then((house_holds)=>{
				let data = [];
				if(house_holds){
					data = house_holds;
				}else{
					log.error("No house holds");
				}
				res.render('index',{houses:data});
			});
		}
	};
	MongoApi.connect(onConnect);
});
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
				collection.insert(house,(err,doc)=>{
					if(err){
						log.error(err);
						socket.emit("error_init",{reconnect:true});
					}else{
						log.info("Init : " + house._id);
						socket.emit("sucess_init",house);
					}
				});
			}
		};
		MongoApi.connect(onConnect);
	});
	socket.on('reconnect',(data)=>{
		if(data._id){
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
										log.info("connected : " + data._id);
										socket.emit('success_connect',{reconnect:false});
									}
								});
							}else{
								log.error("Not found : "+ data._id);
								socket.emit("error",{reconnect:true});	
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
	socket.on('sync',(data)=>{
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
						}else{
							if(doc){
								var rpiDate = new Date(data.modified);
								var serverDate = new Date(doc.modified);
								if(rpiData>serverData){
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
									});
								}else{
									socket.emit('need_sync',doc);
								}
							}else{
								log.error("Not found : "+ data._id);
								socket.emit("error",{reconnect:true});	
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
					}else{
						if(doc){
							doc.connected = false;
							doc.modified = model.getDateTime;
							collection.update({_id:id},doc,(err,d)=>{
								if(err){
									log.error(err);
								}
							});
						}
					}
				});
			}
		});
	});
});
module.exports = router;
