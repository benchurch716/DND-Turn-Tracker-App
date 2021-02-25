module.exports = function () {
    var express = require('express');
    var router = express.Router();
    var mysql = require('./credentials.js');

    function getConditions(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query('SELECT * FROM Conditions', function (err, rows) {
                if (err) {
                    reject(error);
                } else {
                    resolve(context.conditions = rows);
                }
            });
        });
    }

    router.get('/', function (req, res, next) {
        var context = {};
        context.pageTitle = "Conditions"
        context.jsscripts = ["deleteCondition.js"];
        getConditions(res, mysql, context).then(result => res.render('Conditions', context));
    });

    // Route to add Conditions to the table from the form
    router.post('/', function (req, res, next) {
        mysql.pool.query('INSERT INTO Conditions (name, effect) VALUES (?, ?)', [req.body.name, req.body.effect], function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            res.redirect('/Conditions');
        });
    });
    // Route to delete encounter from the table
    router.delete('/:id', function (req, res, next) {
        mysql.pool.query('DELETE FROM Conditions WHERE conID=?', [req.params.id], function (err, rows, fields) {
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
