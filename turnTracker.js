var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var mysql = require('./credentials.js');
var path = require('path');
var fs = require('fs');
//var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3035);
app.use(express.static('public'));

app.get('/', function (req, res, next) {
  var context = {};
  context.pageTitle = "Index";
  res.render('index', context);
});
  
app.get('/characters',function(req,res,next){
  var context = {};
  context.pageTitle = "Characters";
  mysql.pool.query('SELECT * FROM Characters', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    };
  context.characters = rows;
  res.render('Characters', context);
  });
});

app.get('/characterdetails', function (req, res, next) {
  var context = {};
  context.pageTitle = "Character Details";
  let charID = req.query.charID;
  mysql.pool.query('SELECT charID, name FROM Characters', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.characters = rows;
  });
  mysql.pool.query('SELECT con.name, con.effect '+
    'FROM Conditions con '+
    'INNER JOIN Conditions_Characters cc '+
    'ON con.conID = cc.conID '+
    'WHERE charID = ?', [charID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.conditions_characters = rows;
    });
  mysql.pool.query('SELECT con.name FROM Conditions con WHERE con.conID NOT IN (SELECT con.conID FROM Conditions con JOIN Conditions_Characters cc ON con.conID = cc.conID ' +
    'WHERE cc.charID = ?)', [charID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
    context.conditions = rows;
    });
  mysql.pool.query('SELECT i.name, i.type, i.quantity, i.effect, i.isMagic '+
    'FROM Items i '+
    'WHERE i.heldBy = ?', [charID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.character_items = rows;
    });
  mysql.pool.query('SELECT i.name FROM Items i WHERE i.itemID NOT IN (SELECT itemID FROM Items ' +
    'WHERE heldBy = ?)', [charID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
    context.items = rows;
  res.render('CharacterDetails', context);
  });
});

app.get('/conditions', function (req, res, next) {
  var context = {};
  context.pageTitle = "Conditions";
  mysql.pool.query('SELECT * FROM Conditions', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    };
  context.conditions = rows;
  res.render('Conditions', context);
  });
});

app.get('/encounters', function (req, res, next) {
  var context = {};
  mysql.pool.query('SELECT * FROM Encounters', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.encounters = rows;
    context.pageTitle = "Encounters"
    res.render('Encounters', context)
  });
});

app.get('/items', function (req, res, next) {
  var context = {};
  mysql.pool.query('SELECT * FROM Items', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.items = rows;
    context.pageTitle = "Items";
    res.render('Items', context);
  });
});

app.get('/turnorder', function (req, res, next) {
  var context = {};
  context.pageTitle = "Turn Order";
  let enID = req.query.enID;
  mysql.pool.query('SELECT c.name, c.playerCharacter, c.hostileToPlayer, ec.initiativeTotal, con.name conName ' +
    'FROM Characters c ' +
    'JOIN Encounters_Characters ec ' +
    'ON c.charID = ec.charID ' +
    'LEFT JOIN Conditions_Characters cc ' +
    'ON cc.charID = c.charID ' +
    'LEFT JOIN Conditions con ' +
    'ON con.conID = cc.conID ' +
    'WHERE enID = ?', [enID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.encounter_characters = rows;
    });
  mysql.pool.query('SELECT c.name FROM Characters c WHERE c.charID NOT IN (SELECT c.charID FROM Characters c JOIN Encounters_Characters ec ON c.charID = ec.charID ' +
    'WHERE ec.enID = ?)', [enID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.characters = rows;
    });
  mysql.pool.query('SELECT enID FROM Encounters', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.encounters = rows;
    res.render('TurnOrder', context);
  });
});

//Source: https://medium.com/@johnkolo/how-to-run-multiple-sql-queries-directly-from-an-sql-file-in-node-js-part-1-dce1e6dd2def
app.get('/reset', function (req, res, next) {
  var context = {};
  context.pageTitle = "Reset to Sample Data";
  console.log("Query Started");
  let resetQuery = fs.readFileSync('DatabaseScripts.sql').toString();
  mysql.pool.query(resetQuery, function (err, rows) {
    if (err) {
      next(err);
      return;
    } else {
      console.log("Query Complete");
      context.queryStatus = "Query Complete";
    }
    res.render('Reset', context);
  });
});

app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function () {
  console.log('Express started on http://flip3.engr.oregonstate.edu/:' + app.get('port') + '; press Ctrl-C to terminate.');
});
