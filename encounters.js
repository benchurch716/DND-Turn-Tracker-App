module.exports = function () {
    var express = require('express');
    var router = express.Router();
    var mysql = require('./credentials.js');

    function getEncounters(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query('SELECT * FROM Encounters', function (err, rows) {
                if (err) {
                    reject(error);
                } else {
                    resolve(context.encounters = rows);
                }
            });
        });
    }

    router.get('/', function (req, res, next) {
        var context = {};
        context.pageTitle = "Encounters"
        context.jsscripts = ["deleteEncounter.js"];
        getEncounters(res, mysql, context).then(result => res.render('Encounters', context));
    });

    // Route to add encounters to the table from the form
    router.post('/', function (req, res, next) {
        mysql.pool.query('INSERT INTO Encounters (round, setting) VALUES (?, ?)', [req.body.round, req.body.setting], function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            res.redirect('/encounters');
        });
    });
    // Route to delete encounter from the table
    router.delete('/:id', function (req, res, next) {
        mysql.pool.query('DELETE FROM Encounters WHERE enID=?', [req.params.id], function (err, rows, fields) {
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