-- academy_shop: teaching mini-schema for Chapter 6 of Zero to SDET.
-- Not related to the live QA Academy Platform application: this is a
-- standalone schema, built to practice SQL from basic to advanced.

DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

CREATE TABLE countries (
    country_id      SERIAL PRIMARY KEY,
    country_name    VARCHAR(80) NOT NULL UNIQUE,
    region          VARCHAR(50) NOT NULL
);

CREATE TABLE employees (
    employee_id     SERIAL PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    department      VARCHAR(50) NOT NULL,
    salary          NUMERIC(10,2) NOT NULL CHECK (salary > 0),
    hire_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    manager_id      INTEGER REFERENCES employees(employee_id),
    country_id      INTEGER REFERENCES countries(country_id)
);

CREATE TABLE addresses (
    address_id      SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL UNIQUE REFERENCES employees(employee_id),
    street          VARCHAR(120) NOT NULL,
    city            VARCHAR(80) NOT NULL,
    postal_code     VARCHAR(20) NOT NULL,
    country_id      INTEGER REFERENCES countries(country_id)
);

CREATE TABLE categories (
    category_id         SERIAL PRIMARY KEY,
    name                VARCHAR(80) NOT NULL,
    description         TEXT,
    parent_category_id  INTEGER REFERENCES categories(category_id)
);

CREATE TABLE products (
    product_id      SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id     INTEGER REFERENCES categories(category_id),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    customer_id     SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    referred_by     INTEGER REFERENCES customers(customer_id)
);

CREATE TABLE orders (
    order_id        SERIAL PRIMARY KEY,
    customer_id     INTEGER NOT NULL REFERENCES customers(customer_id),
    employee_id     INTEGER REFERENCES employees(employee_id),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_item_id   SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(order_id),
    product_id      INTEGER NOT NULL REFERENCES products(product_id),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);

CREATE TABLE audit_log (
    log_id          SERIAL PRIMARY KEY,
    table_name      VARCHAR(50) NOT NULL,
    operation       VARCHAR(10) NOT NULL,
    record_id       INTEGER NOT NULL,
    changed_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details         TEXT
);
