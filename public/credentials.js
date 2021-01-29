var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_cheekc',
  password        : '9003',
  database        : 'cs340_cheekc'
});

module.exports.pool = pool;