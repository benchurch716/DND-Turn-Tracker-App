var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var mysql = require('./credentials.js');
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3035);
app.use(express.static('public'));

app.get('/',function(req,res,next){
  var context = {};
  context.pageTitle = "Index"
  res.render('index', context)
});

app.get('/characterdetails',function(req,res,next){
  var context = {};
  context.pageTitle = "Character Details"
  res.render('CharacterDetails', context)
});

app.get('/conditions',function(req,res,next){
  var context = {};
  context.pageTitle = "Conditions"
  res.render('Conditions', context)
});

app.get('/encounters',function(req,res,next){
  var context = {};
  context.pageTitle = "Encounters"
  res.render('Encounters', context)
});

app.get('/items',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM items', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  context.items = rows;
  //context.sampleItemRow= [{itemID:1, heldBy:3, name:"Excalibur", type:"Sword", quantity:1, effect:"dope", isMagic:true}]
  context.pageTitle = "Items"
  res.render('Items', context)
  });
});

app.get('/turnorder',function(req,res,next){
  var context = {};
  context.pageTitle = "Turn Order"
  res.render('TurnOrder', context)
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
