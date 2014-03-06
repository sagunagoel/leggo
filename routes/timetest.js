var mongoose = require('mongoose');
var data = require('../public/data.json');
var models = require('../models');

exports.filter = function (req, res) {
  var filters = req.body;
  console.log(filters.finalTime);

  var newTime= new models.Time({
  	"time": filters.finalTime
  });
  newTime.save(afterSaving);

  function afterSaving(err) { // this is a callback
  if(err) {
  	console.log(err); res.send(440); 
  }
}
}