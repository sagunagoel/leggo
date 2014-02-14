var data = require('../public/data.json');

exports.view = function(req, res){
	console.log(data);
	res.render('transport',data);
};