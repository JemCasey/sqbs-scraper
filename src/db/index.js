import mysql from 'mysql';

export function getConnection() {
  var logSql = false;
  var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'qb-stats-admin',
    password: 'password123',
    database: 'qb-stats',
    charset : 'utf8mb4'
  });

  pool.on('connection', function (connection) {
    connection.on('enqueue', function (sequence) {
      if ('Query' === sequence.constructor.name && (logSql)) {
        console.log(sequence.sql);
      }
    });
  });

  return pool;
}