module.exports = function () {
    var express = require('express');
    var router = express.Router();
    var mysql = require('./credentials.js');

    function getTurnOrder(enID, res, mysql, context) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query('SELECT c.charID, c.name, c.playerCharacter, c.hostileToPlayer, ec.initiativeTotal, ec.enID, con.name conName ' +
                'FROM Characters c ' +
                'JOIN Encounters_Characters ec ' +
                'ON c.charID = ec.charID ' +
                'LEFT JOIN Conditions_Characters cc ' +
                'ON cc.charID = c.charID ' +
                'LEFT JOIN Conditions con ' +
                'ON con.conID = cc.conID ' +
                'WHERE enID = ?', [enID], function (err, rows, fields) {
                    if (err) {
                        reject(error);
                    } else {
                        resolve(context.encounter_characters = rows);
                    }
                });
        });
    };

    function getEncounters(enID, res, mysql, context) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query('SELECT enID FROM Encounters', [enID], function (err, rows, fields) {
                if (err) {
                    reject(error);
                } else {
                    resolve(context.encounters = rows);
                }
            });
        });
    };

    function getAvailableCharacters(enID, res, mysql, context) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query('SELECT c.name, c.charID, c.initiativeBonus FROM Characters c WHERE c.charID NOT IN (SELECT c.charID FROM Characters c JOIN Encounters_Characters ec ON c.charID = ec.charID ' +
                'WHERE ec.enID = ?)', [enID], function (err, rows, fields) {
                    if (err) {
                        reject(error);
                    } else {
                        resolve(context.availableCharacters = rows);
                    }
                });
        });
    };
    //not sure if this needs to be a promise? really just needs to return the number but is async
    function getInitiativeBonus(charID, res, mysql, context) {
        return new Promise((resolve, reject) =>
            mysql.pool.query('SELECT enID FROM Encounters', [enID], function (err, rows, fields) {
                if (err) {
                    reject(error);
                } else {
                    resolve(context.encounters = rows);
                }
            })
        );
    }


    router.get('/', function (req, res, next) {
        var context = {};
        context.pageTitle = "Turn Order";
        context.jsscripts = ["deleteTurn.js"];
        let enID = req.query.enID;
        context.enID = enID;
        getTurnOrder(enID, res, mysql, context)
            .then(resul => getEncounters(enID, res, mysql, context))
            .then(resul => getAvailableCharacters(enID, res, mysql, context))
            .then(result => res.render('TurnOrder', context));
    });

    // Turn Order add character route
    //  working on cleaning this up with functions to make it more readable and the asyn works without callback hell
    router.post('/', function (req, res, next) {
        mysql.pool.query('SELECT initiativeBonus FROM Characters WHERE charID=?', [req.body.charID], function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            let initiaitiveTotal = + rows[0].initiativeBonus + +req.body.initiativeRoll;
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
    router.delete('/:charID&:enID', function (req, res, next) {
        mysql.pool.query('DELETE FROM Encounters_Characters WHERE charID=? and enID=?', [req.params.charID, req.params.enID], function (err, rows, fields) {
            if (err) {
                res.write(JSON.stringify(err));
                res.status(400);
                next(err);
                return;
            } else {
                res.status(202).end();
            };
        });
    });
    return router;
}();