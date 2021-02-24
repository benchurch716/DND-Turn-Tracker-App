module.exports = function () {
    var express = require('express');
    var router = express.Router();
    var mysql = require('./credentials.js');

    function getCharacters(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query('SELECT * FROM Characters', function (err, rows) {
                if (err) {
                    reject(error);
                } else {
                    resolve(context.characters = rows);
                }
            });
        });
    }


    router.get('/', function (req, res, next) {
        var context = {};
        context.pageTitle = "Characters";
        context.jsscripts = ["deleteCharacter.js"];
        getCharacters(res, mysql, context).then(result => res.render('Characters', context));
    });

    // Route to add characters to the table from the form
    router.post('/', function (req, res, next) {
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
    router.delete('/:id', function (req, res, next) {
        mysql.pool.query('DELETE FROM Characters WHERE charID=?', [req.params.id], function (err, rows, fields) {
            if (err) {
                res.write(JSON.stringify(err));
                res.status(400);
                next(err);
                return;
            } else {
                res.status(202).end();
            }
        });
    });
    return router;
}();