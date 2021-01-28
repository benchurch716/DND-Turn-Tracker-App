var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var credentials = require('./credentials.js');
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3035);
app.use(express.static('public'));

app.get('/',function(req,res,next){
  res.render('index')
});

app.get('/characterdetails',function(req,res,next){
  res.render('CharacterDetails')
});

app.get('/conditions',function(req,res,next){
  res.render('Conditions')
});

app.get('/encounters',function(req,res,next){
  res.render('Encounters')
});

app.get('/items',function(req,res,next){
  res.render('Items')
});

app.get('/turnorder',function(req,res,next){
  res.render('TurnOrder')
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip3.engr.oregonstate.edu/:' + app.get('port') + '; press Ctrl-C to terminate.');
});
