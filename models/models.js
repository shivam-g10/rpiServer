var ObjectID = require('mongodb').ObjectID;

var offset = +5.5;
var models = {
	
	HouseHold:{
		_id:"",
		name:"",
		controllers: [],
		tasks:[
			{
				controllerId:"",
				date: "",
				task:false,
				duration:0
			}
		],
		connected:false,
		sync:false,
		created:"",
		modified:""
		
	},
	controller:{
		_id:"",
		name:"",
		status:false,
		created:"",
		modified:""
	},
	newObjectId : function(){
		var objectId = new ObjectID();
		return objectId.toHexString();
	},
	getDateTime: function(){
		return (new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" ));
	}
};
module.exports = models;