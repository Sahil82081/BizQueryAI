import pytest
from app.services.sql_validator import SQLValidator

def test_valid_select():
    sql = "SELECT * FROM customers WHERE id = 1"
    is_valid, _ = SQLValidator.validate_query(sql)
    assert is_valid == True

def test_valid_cte():
    sql = "WITH regional_sales AS (SELECT region, SUM(amount) AS total_sales FROM orders GROUP BY region) SELECT region FROM regional_sales;"
    is_valid, _ = SQLValidator.validate_query(sql)
    assert is_valid == True

def test_multiple_statements():
    sql = "SELECT * FROM users; DROP TABLE users;"
    is_valid, _ = SQLValidator.validate_query(sql)
    assert is_valid == False

def test_malicious_drop():
    sql = "DROP TABLE customers"
    is_valid, _ = SQLValidator.validate_query(sql)
    assert is_valid == False

def test_malicious_update():
    sql = "UPDATE customers SET role='admin'"
    is_valid, _ = SQLValidator.validate_query(sql)
    assert is_valid == False

def test_malicious_insert():
    sql = "INSERT INTO users (name) VALUES ('hacker')"
    is_valid, _ = SQLValidator.validate_query(sql)
    assert is_valid == False

def test_malicious_truncate():
    sql = "TRUNCATE TABLE finance.expenses"
    is_valid, _ = SQLValidator.validate_query(sql)
    assert is_valid == False
