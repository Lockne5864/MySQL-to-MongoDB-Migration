const { MongoClient } = require('mongodb');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { loadConfig } = require('./config');

async function createIndexes(collection) {
  await Promise.all([
    collection.createIndex({ manager_id: 1 }),
    collection.createIndex({ title: 1 }),
    collection.createIndex({ department: 1, salary: 1 }),
  ]);
}

async function queryByManager(collection, input) {
  let managerId;
  if (/^\d+$/.test(input.trim())) {
    managerId = Number(input.trim());
  } else {
    // Busca pelo nome exato, ignorando maiúsculas/minúsculas, sem regex de usuário.
    const manager = await collection.findOne(
      { name: input.trim() },
      { collation: { locale: 'en', strength: 2 } }
    );
    if (!manager) return [];
    managerId = manager.employee_id;
  }
  return collection.find({ manager_id: managerId }).sort({ employee_id: 1 }).toArray();
}

async function queryByTitle(collection, title) {
  return collection.find({ title: title.trim() }).sort({ employee_id: 1 }).toArray();
}

async function queryByDepartment(collection, department) {
  return collection.find({ department: department.trim() }).sort({ employee_id: 1 }).toArray();
}

async function queryAverageSalary(collection) {
  return collection.aggregate([
    { $match: { salary: { $type: 'number' }, department: { $type: 'string' } } },
    { $group: { _id: '$department', averageSalary: { $avg: '$salary' }, employees: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
}

async function main() {
  const config = loadConfig();
  const client = new MongoClient(config.mongodb.uri);
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    await client.connect();
    const collection = client.db(config.mongodb.database).collection(config.mongodb.collection);
    await createIndexes(collection);
    while (true) {
      console.log('\n[a] Equipe de um gerente | [b] Cargo | [c] Departamento | [d] Média salarial | [s] Sair');
      const option = (await rl.question('Opção: ')).trim().toLowerCase();
      if (option === 's') break;
      let results;
      switch (option) {
        case 'a': results = await queryByManager(collection, await rl.question('Nome exato ou ID do gerente: ')); break;
        case 'b': results = await queryByTitle(collection, await rl.question('Cargo: ')); break;
        case 'c': results = await queryByDepartment(collection, await rl.question('Departamento: ')); break;
        case 'd': results = await queryAverageSalary(collection); break;
        default: console.log('Opção inválida.'); continue;
      }
      console.log(`Encontrado(s): ${results.length}`);
      console.table(results.slice(0, 20).map(({ _id, ...fields }) => fields));
      if (results.length > 20) console.log('Exibindo apenas os primeiros 20 registros.');
    }
  } finally {
    rl.close();
    await client.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Erro nos relatórios:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { createIndexes, queryByManager, queryByTitle, queryByDepartment, queryAverageSalary };
