var mongoClient = require('mongodb').MongoClient;
var MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/serverOnline';

var MongoApi = {};
MongoApi.connect = function(callback){
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
module.exports=MongoApi;