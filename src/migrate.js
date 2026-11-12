const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const { loadConfig } = require('./config');
const { toMongoEmployee } = require('./transform');

// Seleciona uma página de funcionários; recupera o último salário, cargo e
// departamento de cada pessoa e o gerente correspondente ao departamento.
// A paginação por emp_no evita carregar a tabela inteira na memória.
// Requer MySQL 8+ (CTEs e ROW_NUMBER).
const SELECT_PAGE = `
WITH page AS (
  SELECT emp_no, first_name, last_name
  FROM employees
  WHERE emp_no > ?
  ORDER BY emp_no
  LIMIT ?
),
ranked_salary AS (
  SELECT s.emp_no, s.salary,
    ROW_NUMBER() OVER (PARTITION BY s.emp_no ORDER BY s.to_date DESC, s.from_date DESC) AS pos
  FROM salaries s JOIN page p ON p.emp_no = s.emp_no
),
ranked_title AS (
  SELECT t.emp_no, t.title,
    ROW_NUMBER() OVER (PARTITION BY t.emp_no ORDER BY t.to_date DESC, t.from_date DESC) AS pos
  FROM titles t JOIN page p ON p.emp_no = t.emp_no
),
ranked_department AS (
  SELECT de.emp_no, de.dept_no,
    ROW_NUMBER() OVER (PARTITION BY de.emp_no ORDER BY de.to_date DESC, de.from_date DESC) AS pos
  FROM dept_emp de JOIN page p ON p.emp_no = de.emp_no
),
ranked_manager AS (
  SELECT dm.dept_no, dm.emp_no AS manager_id,
    ROW_NUMBER() OVER (PARTITION BY dm.dept_no ORDER BY dm.to_date DESC, dm.from_date DESC) AS pos
  FROM dept_manager dm
  JOIN (SELECT DISTINCT dept_no FROM ranked_department WHERE pos = 1) used_dept
    ON used_dept.dept_no = dm.dept_no
)
SELECT p.emp_no AS employee_id,
       CONCAT(p.first_name, ' ', p.last_name) AS employee_name,
       s.salary AS latest_salary,
       t.title,
       d.dept_name AS department_name,
       m.manager_id
FROM page p
LEFT JOIN ranked_salary s ON s.emp_no = p.emp_no AND s.pos = 1
LEFT JOIN ranked_title t ON t.emp_no = p.emp_no AND t.pos = 1
LEFT JOIN ranked_department de ON de.emp_no = p.emp_no AND de.pos = 1
LEFT JOIN departments d ON d.dept_no = de.dept_no
LEFT JOIN ranked_manager m ON m.dept_no = de.dept_no AND m.pos = 1
ORDER BY p.emp_no
`;

async function migrate() {
  const config = loadConfig();
  const mysqlPool = mysql.createPool(config.mysql);
  const mongoClient = new MongoClient(config.mongodb.uri);
  let imported = 0;

  try {
    await mongoClient.connect();
    const collection = mongoClient
      .db(config.mongodb.database)
      .collection(config.mongodb.collection);
    await collection.createIndex({ employee_id: 1 }, { unique: true });

    let lastEmployeeId = 0;
    while (true) {
      const [rows] = await mysqlPool.execute(SELECT_PAGE, [lastEmployeeId, config.batchSize]);
      if (rows.length === 0) break;

      const operations = rows.map((row) => {
        const employee = toMongoEmployee(row);
        return {
          updateOne: {
            filter: { employee_id: employee.employee_id },
            update: { $set: employee },
            upsert: true,
          },
        };
      });
      await collection.bulkWrite(operations, { ordered: false });
      imported += rows.length;
      lastEmployeeId = Number(rows[rows.length - 1].employee_id);
      console.log(`Processados ${imported} funcionário(s). Último ID: ${lastEmployeeId}`);
    }
    console.log(`Concluído: ${imported} funcionário(s) processados. Reexecutar não gera duplicatas.`);
  } finally {
    await Promise.allSettled([mysqlPool.end(), mongoClient.close()]);
  }
}

if (require.main === module) {
  migrate().catch((error) => {
    console.error('Erro durante a migração:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { migrate, SELECT_PAGE };
