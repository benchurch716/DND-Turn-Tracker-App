var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var mysql = require('./credentials.js');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3036);
app.use(express.static('public'));


app.get('/', function (req, res, next) {
  var context = {};
  context.pageTitle = "Index";
  res.render('index', context);
});

// Characters
app.get('/characters', function (req, res, next) {
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
// Route to add characters to the table from the form
app.post('/characters', function (req, res, next) {
  console.log(req.body);
  mysql.pool.query('INSERT INTO Characters (name, initiativeBonus, playerCharacter, hostileToPlayer) VALUES (?, ?, ?, ?)',
    [req.body.name, req.body.initiativeBonus, req.body.playerCharacter, req.body.hostileToPlayer], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/characters');
    });
});
// Route to delete characters from the table
app.post('/charactersdelete', function (req, res, next) {
  mysql.pool.query('DELETE FROM Characters WHERE charID=?', [req.body.charID], function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });
  res.redirect('/characters');
});

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
  console.log("body = "+JSON.stringify(req.body));
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
// Route to add conditions to the table from the form
app.post('/conditions', function (req, res, next){
  mysql.pool.query('INSERT INTO Conditions (name, effect) VALUES (?, ?)', [req.body.name, req.body.effect], function (err, rows, fields){
    if (err) {
      next(err);
      return;
    }
    res.redirect('/conditions');
  });
});
// Route to delete condition from the table
app.post('/conditionsdelete', function (req, res, next){
  mysql.pool.query('DELETE FROM Conditions WHERE conID=?', [req.body.conID], function (err, rows, fields){
    if (err) {
      next(err);
      return;
    }
    res.redirect('/conditions');
  });
});

// Encounters
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
// Route to add encounters to the table from the form
app.post('/encounters', function (req, res, next) {
  mysql.pool.query('INSERT INTO Encounters (round, setting) VALUES (?, ?)', [req.body.round, req.body.setting], function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    res.redirect('/encounters');
  });
});
// Route to delete encounter from the table
app.post('/encountersdelete', function (req, res, next) {
  mysql.pool.query('DELETE FROM Encounters WHERE enID=?', [req.body.enID], function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });
  res.redirect('/encounters');
});

//Items
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
// Route to add items to the table from the form
app.post('/items', function (req, res, next){
  mysql.pool.query('INSERT INTO Items (name, effect, type, quantity, isMagic) VALUES (?, ?, ?, ?, ?)', [req.body.name, req.body.effect, req.body.type, req.body.quantity, req.body.isMagic], function (err, rows, fields){
    if (err) {
      next(err);
      return;
    }
    res.redirect('/items');
  });
});
// Route to delete item from the table
app.post('/itemsdelete', function (req, res, next){
  mysql.pool.query('DELETE FROM Items WHERE itemID=?', [req.body.itemID], function (err, rows, fields){
    if (err) {
      next(err);
      return;
    }
    res.redirect('/items');
  });
});

//Turn Order
app.get('/turnorder', function (req, res, next) {
  var context = {};
  context.pageTitle = "Turn Order";
  let enID = req.query.enID;
  context.enID = enID;
  mysql.pool.query('SELECT c.charID, c.name, c.playerCharacter, c.hostileToPlayer, ec.initiativeTotal, con.name conName ' +
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
  //select characters availble to add to the encounter
  mysql.pool.query('SELECT c.name, c.charID, c.initiativeBonus FROM Characters c WHERE c.charID NOT IN (SELECT c.charID FROM Characters c JOIN Encounters_Characters ec ON c.charID = ec.charID ' +
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
// Turn Order add character route
app.post('/turnorder', function (req, res, next) {
  mysql.pool.query('SELECT initiativeBonus FROM Characters WHERE charID=?', [req.body.charID], function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    let initiaitiveTotal = +rows[0].initiativeBonus + +req.body.initiativeRoll;
    mysql.pool.query('INSERT INTO Encounters_Characters (enID, charID, initiativeTotal) VALUES (?, ?, ?)', [req.body.enID, req.body.charID, initiaitiveTotal], function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }

    });
  });
  res.redirect('/turnorder?enID=' + [req.body.enID]);
});
// Turn order remove route
app.post('/turnorderdelete', function (req, res, next) {
  mysql.pool.query('DELETE FROM Encounters_Characters WHERE charID=? and enID=?', [req.body.charID, req.body.enID], function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });
  res.redirect('/turnorder?enID=' + [req.body.enID]);
});

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
