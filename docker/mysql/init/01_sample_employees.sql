-- Dados 100% fictícios para demonstração. Não representam funcionários reais.
USE employees;
CREATE TABLE employees (
  emp_no INT NOT NULL PRIMARY KEY,
  birth_date DATE NOT NULL,
  first_name VARCHAR(40) NOT NULL,
  last_name VARCHAR(40) NOT NULL,
  gender ENUM('M','F') NOT NULL,
  hire_date DATE NOT NULL
);
CREATE TABLE departments (
  dept_no CHAR(4) NOT NULL PRIMARY KEY,
  dept_name VARCHAR(40) NOT NULL
);
CREATE TABLE salaries (
  emp_no INT NOT NULL, salary INT NOT NULL, from_date DATE NOT NULL, to_date DATE NOT NULL,
  PRIMARY KEY (emp_no, from_date)
);
CREATE TABLE titles (
  emp_no INT NOT NULL, title VARCHAR(50) NOT NULL, from_date DATE NOT NULL, to_date DATE NOT NULL,
  PRIMARY KEY (emp_no, title, from_date)
);
CREATE TABLE dept_emp (
  emp_no INT NOT NULL, dept_no CHAR(4) NOT NULL, from_date DATE NOT NULL, to_date DATE NOT NULL,
  PRIMARY KEY (emp_no, dept_no)
);
CREATE TABLE dept_manager (
  emp_no INT NOT NULL, dept_no CHAR(4) NOT NULL, from_date DATE NOT NULL, to_date DATE NOT NULL,
  PRIMARY KEY (emp_no, dept_no)
);
INSERT INTO departments VALUES
('d001','Sales'),('d002','Development'),('d003','Finance');
INSERT INTO employees VALUES
(1001,'1995-04-20','Ana','Souza','F','2020-02-01'),
(1002,'1988-08-03','Bruno','Oliveira','M','2016-05-10'),
(1003,'1992-12-12','Carla','Lima','F','2019-08-12'),
(1004,'1985-01-22','Diego','Rocha','M','2015-06-05'),
(1005,'1997-03-11','Eva','Costa','F','2021-04-01'),
(1006,'1989-09-15','Felipe','Alves','M','2016-10-20');
INSERT INTO salaries VALUES
(1001,60000,'2020-02-01','2023-01-01'),(1001,70000,'2023-01-01','9999-01-01'),
(1002,95000,'2016-05-10','9999-01-01'),
(1003,90000,'2019-08-12','2023-01-01'),(1003,100000,'2023-01-01','9999-01-01'),
(1004,130000,'2015-06-05','9999-01-01'),
(1005,80000,'2021-04-01','9999-01-01'),
(1006,110000,'2016-10-20','9999-01-01');
INSERT INTO titles VALUES
(1001,'Sales Assistant','2020-02-01','2023-01-01'),(1001,'Sales Representative','2023-01-01','9999-01-01'),
(1002,'Manager','2016-05-10','9999-01-01'),
(1003,'Junior Engineer','2019-08-12','2022-01-01'),(1003,'Engineer','2022-01-01','9999-01-01'),
(1004,'Manager','2015-06-05','9999-01-01'),
(1005,'Financial Analyst','2021-04-01','9999-01-01'),
(1006,'Manager','2016-10-20','9999-01-01');
INSERT INTO dept_emp VALUES
(1001,'d001','2020-02-01','9999-01-01'),(1002,'d001','2016-05-10','9999-01-01'),
(1003,'d002','2019-08-12','9999-01-01'),(1004,'d002','2015-06-05','9999-01-01'),
(1005,'d003','2021-04-01','9999-01-01'),(1006,'d003','2016-10-20','9999-01-01');
INSERT INTO dept_manager VALUES
(1002,'d001','2016-05-10','9999-01-01'),
(1004,'d002','2015-06-05','9999-01-01'),
(1006,'d003','2016-10-20','9999-01-01');
