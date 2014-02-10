var data = require("../data.json");

exports.addFriend = function(req, res) {    
	// Your code goes here
	var name=req.query.name;
	var descrip=req.query.description;
	var json =
	{'name': name,
	'description': descrip,
	'imageURL': 'http://lorempixel.com/400/400/people'
	}
	data["friends"].push(json);
	res.render('add',data);
 };