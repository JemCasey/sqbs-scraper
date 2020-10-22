var mysql = require('mysql');
var migration = require('mysql-migrations');

var connection = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'qb-stats-admin',
  password : 'password123',
  database : 'qb-stats',
  multipleStatements: true
});

migration.init(connection, __dirname);