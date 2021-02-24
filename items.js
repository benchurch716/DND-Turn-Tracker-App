module.exports = function () {
    var express = require('express');
    var router = express.Router();
    var mysql = require('./credentials.js');

    function getItems(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query('SELECT name, effect, type, quantity, isMagic, itemID FROM Items', function (err, rows) {
                if (err) {
                    reject(error);
                } else {
                    resolve(context.items = rows);
                }
            });
        });
    }
    router.get('/', function (req, res, next) {
        var context = {};
        context.pageTitle = "Items";
        context.jsscripts = ["deleteItem.js"];
        getItems(res, mysql, context).then(result => res.render('Items', context));
    });

    // Route to add items to the table from the form
    router.post('/', function (req, res, next) {
        mysql.pool.query('INSERT INTO Items (name, effect, type, quantity, isMagic) VALUES (?, ?, ?, ?, ?)', [req.body.name, req.body.effect, req.body.type, req.body.quantity, req.body.isMagic], function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            res.redirect('/items');
        });
    });
    // Route to delete item from the table
    router.delete('/:id', function (req, res, next) {
        mysql.pool.query('DELETE FROM Items WHERE itemID=?', [req.params.id], function (err, rows, fields) {
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