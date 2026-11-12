// Estrutura de destino (documentos do MongoDB).
function toMongoEmployee(row) {
  if (!Number.isSafeInteger(Number(row.employee_id))) {
    throw new Error('employee_id inválido.');
  }
  return {
    employee_id: Number(row.employee_id),
    name: row.employee_name,
    salary: row.latest_salary == null ? null : Number(row.latest_salary),
    title: row.title ?? null,
    department: row.department_name ?? null,
    manager_id: row.manager_id == null ? null : Number(row.manager_id),
  };
}

module.exports = { toMongoEmployee };
