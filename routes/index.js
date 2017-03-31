var express = require('express');
var request = require('request');
var path = require('path');
var LOG = require('log');
var log  = new LOG();
var router = express.Router();
var MongoApi = require(path.join(__dirname+"/../db/db"));
var model = require(path.join(__dirname+"/../models/models"));
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
module.exports = router;
