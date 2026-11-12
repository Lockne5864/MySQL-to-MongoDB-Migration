const test = require('node:test');
const assert = require('node:assert/strict');
const { toMongoEmployee } = require('../src/transform');
const { positiveInteger } = require('../src/config');

test('transforma o funcionário mantendo o ID estável', () => {
  assert.deepEqual(toMongoEmployee({
    employee_id: 1001, employee_name: 'Ana Souza', latest_salary: '70000',
    title: 'Engineer', department_name: 'Development', manager_id: 1002,
  }), {
    employee_id: 1001, name: 'Ana Souza', salary: 70000,
    title: 'Engineer', department: 'Development', manager_id: 1002,
  });
});

test('aceita salário e gerente ausentes', () => {
  const employee = toMongoEmployee({employee_id: 1003, employee_name: 'Bia Lima'});
  assert.equal(employee.salary, null);
  assert.equal(employee.manager_id, null);
});

test('rejeita ID inválido e lotes inválidos', () => {
  assert.throws(() => toMongoEmployee({ employee_id: 'não-numérico' }));
  assert.throws(() => positiveInteger('BATCH_SIZE', 0));
});
