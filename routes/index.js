var express = require('express');
var request = require('request');
var path = require('path');
var router = express.Router();
//var MongoApi = require(path.join(__dirname+"/../db/db"));
var ID = 2;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/init',function(req,res,next){
	request.get('http://fyp-13bec0547.herokuapp.com/init?id='+ID,function(err,response,body){
		if(err){
			console.log(err);
			res.status(500).send("network request error");
		}else if(response.statusCode===200){
			res.status(200).send(body);
		}
	});
});
router.get('/fetchCMD',function(req,res,next){
	request.get('http://fyp-13bec0547.herokuapp.com/fetchTask?id='+ID,function(err,response,body){
		if(err){
			console.log(err);
			res.status(500).send("network request error");
		}else if(response.statusCode===200){
			res.status(200).send(body);
		}
	});
});
module.exports = router;
