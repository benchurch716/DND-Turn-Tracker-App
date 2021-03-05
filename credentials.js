var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_churchbe',
  password        : '2864',
  database        : 'cs340_churchbe',
  multipleStatements: true 
});

module.exports.pool = pool;
