
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars')

var splashscreen = require('./routes/splashscreen');
var categories = require('./routes/categories');
var time = require('./routes/time');
var transport = require('./routes/transport');
var people = require('./routes/people');
var money = require('./routes/money');
var energy = require('./routes/energy');
var mainresults = require('./routes/results');
var details = require('./routes/details');
var chosen = require('./routes/chosenactivity');
var reflection = require('./routes/reflection');
var help = require('./routes/help');
// Example route
// var user = require('./routes/user');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('Intro HCI secret key'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Add routes here
app.get('/', splashscreen.view);
app.get('/categories',categories.view);
app.get('/time', time.view);
app.get('/transport', transport.view);
app.get('/people', people.view);
app.get('/money', money.view);
app.get('/energy', energy.view);
app.get('/results', mainresults.view);
app.get('/details', details.view);
app.get('/chosenactivity', chosen.view);
app.get('/reflection', reflection.view);
app.get('/help', help.view);
// Example route
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
