// Node.js >=22.9: a flag --env-file-if-exists carrega o arquivo .env.
function positiveInteger(name, defaultValue) {
  const value = Number(process.env[name] ?? defaultValue);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} deve ser um número inteiro positivo.`);
  }
  return value;
}

function loadConfig() {
  return {
    mysql: {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: positiveInteger('MYSQL_PORT', 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'employees',
      waitForConnections: true,
      connectionLimit: 5,
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
      database: process.env.MONGODB_DATABASE || 'employees_portfolio',
      collection: process.env.MONGODB_COLLECTION || 'employees',
    },
    batchSize: positiveInteger('BATCH_SIZE', 500),
  };
}

module.exports = { loadConfig, positiveInteger };
