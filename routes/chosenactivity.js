var data = require('../public/data.json');

exports.view = function(req, res){
	console.log(data);
	var projectID=req.params.id;
	console.log("URL id is " + projectID);
	for(var i=0;i<data['activities'].length;i++){
    	if (data['activities'][i]['id']==projectID) {
    		datanew= data['activities'][i];
    	}
}
	console.log(datanew);
	res.render('chosenactivity',datanew);
};