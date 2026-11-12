const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const { loadConfig } = require('./config');

async function main() {
  const config = loadConfig();
  const mysqlPool = mysql.createPool(config.mysql);
  const mongoClient = new MongoClient(config.mongodb.uri);
  try {
    await mysqlPool.query('SELECT 1');
    console.log('MySQL: conectado.');
    await mongoClient.connect();
    await mongoClient.db(config.mongodb.database).command({ ping: 1 });
    console.log('MongoDB: conectado.');
  } finally {
    await Promise.allSettled([mysqlPool.end(), mongoClient.close()]);
  }
}

main().catch((error) => {
  console.error('Falha de conexão:', error.message);
  process.exitCode = 1;
});
