var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var mysql = require('./credentials.js');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3039);
app.use('/static', express.static('public'));

//Index Page
app.get('/', function (req, res, next) {
  var context = {};
  context.pageTitle = "Index";
  res.render('index', context);
});

// Characters
app.use('/characters', require('./characters.js'));

//Character Details
app.get('/characterdetails', function (req, res, next) {
  var context = {};
  context.pageTitle = "Character Details";
  let charID = req.query.charID;
  context.charID = charID;
  mysql.pool.query('SELECT name FROM Characters WHERE charID=?', [charID], function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.selectedCharacter = rows;
  });
  mysql.pool.query('SELECT charID, name FROM Characters', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.characters = rows;
  });
  mysql.pool.query('SELECT con.conID, con.name, con.effect ' +
    'FROM Conditions con ' +
    'INNER JOIN Conditions_Characters cc ' +
    'ON con.conID = cc.conID ' +
    'WHERE charID = ?', [charID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.conditions_characters = rows;
    });
  mysql.pool.query('SELECT con.name, con.conID FROM Conditions con WHERE con.conID NOT IN (SELECT con.conID FROM Conditions con JOIN Conditions_Characters cc ON con.conID = cc.conID ' +
    'WHERE cc.charID = ?)', [charID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.conditions = rows;
    });
  mysql.pool.query('SELECT i.itemID, i.name, i.type, i.quantity, i.effect, i.isMagic ' +
    'FROM Items i ' +
    'WHERE i.heldBy = ?', [charID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.character_items = rows;
    });
  mysql.pool.query('SELECT i.name, i.itemID FROM Items i WHERE i.itemID NOT IN (SELECT itemID FROM Items ' +
    'WHERE heldBy = ?)', [charID], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.items = rows;
      res.render('CharacterDetails', context);
    });
});
// Route to add conditions to the selected character
app.post('/characterdetailsaddconditions', function (req, res, next) {
  console.log("body = " + JSON.stringify(req.body));
  mysql.pool.query('INSERT INTO Conditions_Characters (conID, charID) VALUES (?, ?)', [req.body.conID, req.body.charID], function (err, rows, fields) {
    if (err) {
      res.write(JSON.stringify(err));
      res.end();
    }
    res.redirect('/characterdetails?charID=' + [req.body.charID]);
  });
});
// Route to add items to the selected character
app.post('/characterdetailsadditems', function (req, res, next) {
  mysql.pool.query('UPDATE Items SET heldBy=? WHERE itemID=?', [req.body.charID, req.body.itemID], function (err, rows, fields) {
    if (err) {
      res.write(JSON.stringify(err));
      res.end();
    }
    res.redirect('/characterdetails?charID=' + [req.body.charID]);
  });
});
// Route to remove condition from character
app.post('/characterdetailsdeletecondition', function (req, res, next) {
  mysql.pool.query('DELETE FROM Conditions_Characters WHERE conID=? and charID=?', [req.body.conID, req.body.charID], function (err, rows, fields) {
    if (err) {
      res.write(JSON.stringify(err));
      res.end();
    }
  });
  res.redirect('/characterdetails?charID=' + [req.body.charID]);
});
// Route to remove item from character
app.post('/characterdetailsdeleteitem', function (req, res, next) {
  mysql.pool.query('UPDATE Items SET heldBy=NULL WHERE itemID=?', [req.body.itemID], function (err, rows, fields) {
    if (err) {
      res.write(JSON.stringify(err));
      res.end();
    }
  });
  res.redirect('/characterdetails?charID=' + [req.body.charID]);
});

// Conditions
app.use('/conditions', require('./conditions.js'));
// Encounters
app.use('/encounters', require('./encounters.js'));
//Items

app.use('/items', require('./items.js'));
//Turn Order
app.use('/turnorder', require('./turnOrder.js'));


//Reset (adapated from Source: https://medium.com/@johnkolo/how-to-run-multiple-sql-queries-directly-from-an-sql-file-in-node-js-part-1-dce1e6dd2def)
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
