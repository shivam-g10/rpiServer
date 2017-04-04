var express = require('express');
var request = require('request');
var path = require('path');
var LOG = require('log');
var log  = new LOG();
var router = express.Router();
var MongoApi = require(path.join(__dirname+"/../db/db"));
var model = require(path.join(__dirname+"/../models/models"));
var sockets = require(path.join(__dirname+"/../worker/io"));
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render("index");
});
router.get("/getData",(req,res,next)=>{
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
				res.send({houses:data});
				db.close();
			});
		}
	};
	MongoApi.connect(onConnect);
});
router.get("/main",(req,res,next)=>{
	res.render("main");
});
router.get('/house/:id', function(req, res, next) {
	var id = req.params.id;
	let onConnect = (err,db)=>{
		if(err){
			log.error(err);
			res.send("Error connecting to database");
		}else{
			let collection = db.collection("house_hold");
			collection.findOne({_id:id},(err,doc)=>{
				if(err){
					log.error(err);
					res.send("Error finding object");
				}else{
					if(doc){
						res.render("house",{house:doc});
					}else{
						res.send("No object found of id : " +  id );
					}
				}
			});
		}
	};

	MongoApi.connect(onConnect);
});
router.post('/house/trunOn', function(req, res, next) {
	var house = req.body.house;
	var controller = req.body.controller;
	let onConnect = (err,db)=>{
		if(err){
			log.error(err);
			res.send("Error connecting to database");
		}else{
			log.info("turnOn",house,controller);
			res.send(sockets.turnOn(house,controller));
		}
	};

	MongoApi.connect(onConnect);
});
router.post('/house/trunOff', function(req, res, next) {
	var house = req.body.house;
	var controller = req.body.controller;
	let onConnect = (err,db)=>{
		if(err){
			log.error(err);
			res.send("Error connecting to database");
		}else{
			log.info("turnOff",house,controller);
			res.send(sockets.turnOff(house,controller));
		}
	};

	MongoApi.connect(onConnect);
});
module.exports = router;
