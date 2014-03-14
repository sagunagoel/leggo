var mongoose = require('mongoose');
var models = require('../models');

exports.view = function(req, res){
	res.render('suggestion');
};

exports.submit = function(req, res){
  var suggestion = req.body;
  var newSuggestion = new models.Suggestion({
  	name: suggestion.name,
    description: suggestion.description,
    address: suggestion.location,
    hours: {
      starttime: suggestion.starttime,
      endtime: suggestion.endtime
    },
    length: suggestion.length,
    energylevel: suggestion.energy,
    thingslist: suggestion.things
  });
  newSuggestion.save(afterSaving);

  function afterSaving(err, data) { // this is a callback
    if(err) {
      console.log(err); //res.send(440);
      res.json({ response: 'error' });
    } else {
      console.log('saved: ' + data);
      res.json({ response: 'success' });
    }
  }
}