var express = require('express');
var request = require('request');
var path = require('path');
var router = express.Router();
var MongoApi = require(path.join(__dirname+"/../db/db"));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/main',function(req,res,next){
	var onConnect = function(err,db){
		if(err){
			console.log(err);
			res.render("main",{err:true,errMessage:"db connect error",doc:null});
		}else{
			var collection = db.collection("cmd");
			collection.find(function(err,cursor){
				if(err){
					console.log(err);
					res.render("main",{err:true,errMessage:"Find error",doc:null});
				}else{
					cursor.toArray().then(function(data){
						if(data){res.render("main",{err:false,errMessage:"null",doc:data});}else{console.log("No data");}
					});
				}
			});
		}
	};
	MongoApi.connect(onConnect);
});
router.get('/addCmdToQueue',function(req,res,next){
	var params = req.query;
	var id = parseInt(params.id);
	var onConnect=function(err,db){
		if(err){
			console.log(err);
			res.status(500).send("Db error");
		}else{
			var collection = db.collection("cmd");
			var query = {
				'_id':id
			};
			collection.findOne(query,function(err,doc){
				if(err){
					console.log(err);
					res.status(500).send("Find error");
				}else{
					doc.cmd.push(params.cmd);
					var cmd = doc.cmd;
					var onUpdate = function(err){
						if(err){
							console.log(err);
							res.status(500).send("Update error");
						}else{
							res.status(200).send("CMD Updated, Current queue: "+ cmd);
						}
					};
					collection.update(query,doc,onUpdate);
					
					db.close()
				}
			});
		}
	
	}
	MongoApi.connect(onConnect);
	//console.log(db);
	/*db.collection('cmds').findOne({},function(err,doc){
		if(err){console.log(err);}else{console.log(doc);}
	});
	console.log(params);*/
});
router.get('/init',function(req,res,next){
	var params = req.query;
	var id = parseInt(params.id);
	var onConnect = function(err,db){
		if(err){
			console.log(err);
			res.status(500).send("db connection error");
		}else{
			var collection = db.collection("cmd");
			var query = {
				'_id':id
			};
			var onFind = function(err,doc){
				if(err){
					console.log(err);
					res.status(500).send("Find error");
				}else{
					if(doc){
						var ip = req.connection.remoteAddress;
						console.log(ip);
						doc.latestIP = ip;
						
						var onUpdate = function(err){
						if(err){
							console.log(err);
							res.status(500).send("Update error");
						}else{
							res.status(200).send("Ip updated "+ ip);
						}
					};
					collection.update(query,doc,onUpdate);
					}
					else {
						collection.insert({'_id':id,'cmd':[],'latestIP':req.connection.remoteAddress},function(err,doc){
							if(err){
								console.log(err);
								res.status(500).send("insert failed");
							}else{
								console.log("Init Success");
								res.status(200).send("insert success");
							}
						});
					}
				}
			}
			collection.findOne(query,onFind);
		}
	}
	MongoApi.connect(onConnect);
})
module.exports = router;
