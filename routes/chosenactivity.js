var data = require('../data.json');
var models = require('../models');

exports.view = function(req, res){
	// console.log(data);
	var projectID=req.params.id;
	console.log("URL id is " + projectID);
	// for(var i=0;i<data['activities'].length;i++){
    	// if (data['activities'][i]['id']==projectID) {
    		// datanew= data['activities'][i];
    	// }
// }
	// console.log(datanew);
  
  var query = models.Activity.findOne({ id: parseInt(req.params.id) });
  query.exec(afterQuery);
	
  function afterQuery (err, data) {
    console.log(data);
    res.render('chosenactivity', data);
  }

};