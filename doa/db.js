var mongoClient = require('mongodb').MongoClient;
var MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/rpiOffline';

var MongoApi = {};
var connect = function(callback){
	mongoClient.connect(MONGO_URL, function(err,db){
	if(err){
		if(callback){
			callback(err,null);
		}else{
			console.log("err");
			return null;
		}
	}else{
		if(callback){
			callback(null,db);
		}else{
			return db;
		}
	}
});
};
MongoApi.insert = function(collection,data,callback){
	var onConnect = function(err,db){
		if(err){
			callback(err,null);
		}else{
			var col = db.collection(collection);
			col.insert(data,(err,doc)=>{
				if(err){
					callback(err,null);
				}else{
					callback(null,doc);
				}
				db.close();
			}); 
		}
	};
	connect(onConnect);
};
MongoApi.findOne = function(collection,query,callback){
	var onConnect = function(err,db){
		if(err){
			callback(err,null);
		}else{
			var col = db.collection(collection);
			col.findOne(query,(err,doc)=>{
				if(err){
					callback(err,null)
				}else{
					callback(null,doc);
				}
				db.close();
			});
		}
	};
	connect(onConnect);
};
MongoApi.findAll = function(collection,callback){
	var onConnect = function(err,db){
		if(err){
			callback(err,null);
		}else{
			var col = db.collection(collection);
			col.find().toArray().then((data)=>{
				callback(null,data);
				db.close();
			});
		}
	};
	connect(onConnect);
};
MongoApi.update  = function(collection,query,data,callback){
	var onConnect = function(err,db){
		if(err){
			callback(err,null);
		}else{
			var col = db.collection(collection);
			col.update(query,data,(err,doc)=>{
				if(err){
					callback(err,null);
				}else{
					callback(null,doc);
				}
				db.close();
			});
		}
	};
	connect(onConnect);
};
module.exports=MongoApi;