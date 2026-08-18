-- academy_shop: fictional seed data for Chapter 6 of Zero to SDET.
-- All names, emails, salaries and addresses are invented for
-- teaching purposes.

-- countries (1..6): South Korea is left with zero employees assigned, on purpose.
INSERT INTO countries (country_name, region) VALUES
  ('Japan', 'Asia'),
  ('Germany', 'Europe'),
  ('Nigeria', 'Africa'),
  ('India', 'Asia'),
  ('Brazil', 'South America'),
  ('South Korea', 'Asia');

-- employees (1..9): hierarchy is Hannah (CEO) -> Kenji/Ngozi (managers) -> the rest.
-- Arjun Mehta earns more than his manager Kenji Watanabe, on purpose (interview exercise).
INSERT INTO employees (first_name, last_name, email, department, salary, hire_date, manager_id, country_id) VALUES
  ('Hannah', 'Fischer',  'hannah.fischer@example.test',  'Executive', 180000.00, '2019-02-01', NULL, 2),
  ('Kenji',  'Watanabe', 'kenji.watanabe@example.test',  'Sales',      95000.00, '2020-03-10', 1,    1),
  ('Ngozi',  'Adeyemi',  'ngozi.adeyemi@example.test',   'Support',    90000.00, '2020-05-15', 1,    3),
  ('Lukas',  'Weber',    'lukas.weber@example.test',     'Sales',      52000.00, '2021-06-01', 2,    2),
  ('Arjun',  'Mehta',    'arjun.mehta@example.test',     'Sales',      97000.00, '2021-07-20', 2,    4),
  ('Camila', 'Silva',    'camila.silva@example.test',    'Sales',      61000.00, '2022-01-11', 2,    5),
  ('Chidi',  'Okafor',   'chidi.okafor@example.test',    'Support',    48000.00, '2022-02-14', 3,    3),
  ('Greta',  'Hoffmann', 'greta.hoffmann@example.test',  'Support',    47000.00, '2022-04-04', 3,    2),
  ('Yuki',   'Tanaka',   'yuki.tanaka@example.test',     'Support',    51000.00, '2023-01-09', 3,    1);

-- addresses (1..8): Yuki Tanaka (employee_id 9) is left with no registered address.
INSERT INTO addresses (employee_id, street, city, postal_code, country_id) VALUES
  (1, 'Unter den Linden 12',    'Berlin',            '10117', 2),
  (2, 'Shibuya 2-21',           'Tokyo',             '150-0002', 1),
  (3, 'Adeola Odeku St 18',     'Lagos',             '106104', 3),
  (4, 'Marienplatz 5',          'Munich',            '80331', 2),
  (5, 'Marine Drive 44',        'Mumbai',            '400020', 4),
  (6, 'Av. Paulista 900',       'Sao Paulo',         '01310-100', 5),
  (7, 'Ahmadu Bello Way 7',     'Abuja',             '900211', 3),
  (8, 'Speicherstadt 3',        'Hamburg',           '20457', 2);

-- categories (1..8): Wearables (8) is left with no products, on purpose.
INSERT INTO categories (name, description, parent_category_id) VALUES
  ('Electronics',     'Electronic devices and accessories', NULL),
  ('Computers',       'Laptops, monitors and peripherals',       1),
  ('Phones',          'Phones and accessories',                 1),
  ('Home',            'Home goods',                 NULL),
  ('Kitchen',         'Kitchen appliances and utensils', 4),
  ('Furniture',       'Office and home furniture',              4),
  ('Office Supplies', 'Office and stationery supplies',        NULL),
  ('Wearables',       'New category, no products yet',  1);

-- products (1..21): product 21 is left without a category, on purpose.
INSERT INTO products (name, description, price, stock, category_id) VALUES
  ('Laptop Pro 14',          '14-inch laptop for professional use', 1299.99, 15, 2),
  ('Laptop Air 13',          'Lightweight 13-inch laptop',                999.50, 20, 2),
  ('Mechanical Keyboard',    'Backlit mechanical keyboard',             89.90, 40, 2),
  ('Wireless Mouse',         'Ergonomic wireless mouse',                25.50, 100, 2),
  ('27-inch Monitor',        '27-inch IPS monitor',                 249.00, 30, 2),
  ('Smartphone X12',         'High-end phone',                         799.00, 25, 3),
  ('Smartphone Lite',        'Mid-range phone',                        399.00, 50, 3),
  ('Phone Case Clear',       'Clear case',                          12.99, 200, 3),
  ('Screen Protector',       'Tempered glass screen protector',                      8.50, 300, 3),
  ('Blender Pro',            'High-power blender',                  65.00, 35, 5),
  ('Coffee Maker Deluxe',    'Programmable coffee maker',                        89.00, 28, 5),
  ('Non-stick Pan Set',      'Non-stick pan set',            45.00, 40, 5),
  ('Electric Kettle',        'Electric kettle 1.7L',                     32.00, 60, 5),
  ('Office Chair Ergo',      'Ergonomic office chair',                189.00, 18, 6),
  ('Standing Desk',          'Height-adjustable desk',             349.00, 12, 6),
  ('Bookshelf Oak',          'Oak wood bookshelf',                129.00, 10, 6),
  ('Notebook Pack x5',       'Pack of 5 notebooks',                        9.99, 500, 7),
  ('Ballpoint Pen Box',      'Box of ballpoint pens',                           6.50, 800, 7),
  ('Sticky Notes Pack',      'Pack of sticky notes',                   4.25, 600, 7),
  ('Stapler Heavy Duty',     'Heavy duty stapler',               14.75, 150, 7),
  ('Clearance Mystery Item', 'Clearance item without a category',        19.99, 5, NULL),
  ('USB-C Hub',              '6-port USB-C hub, no sales yet',      34.99, 45, 2),
  ('Desk Lamp LED',          'LED desk lamp, no sales yet',   27.00, 25, 6),
  ('Whiteboard 90x60',       'Whiteboard, no sales yet',             55.00,  8, 7);

-- customers (1..12): referral chain via referred_by. Names of diverse origins
-- on purpose: the book is published in both Spanish and English, and the dataset
-- should not read as "only Latin names".
INSERT INTO customers (name, email, created_at, referred_by) VALUES
  ('Amara Okonkwo',  'amara.okonkwo@example.test',   '2026-01-10', NULL),
  ('Liam OConnor',   'liam.oconnor@example.test',    '2026-01-15', 1),
  ('Yuna Kim',       'yuna.kim@example.test',        '2026-01-20', 1),
  ('Priya Nair',     'priya.nair@example.test',      '2026-02-01', 2),
  ('Fatima Alsayed', 'fatima.alsayed@example.test',  '2026-02-05', 2),
  ('Erik Lindqvist', 'erik.lindqvist@example.test',  '2026-02-10', 3),
  ('Mei Chen',       'mei.chen@example.test',        '2026-02-15', NULL),
  ('Noah Bergstrom', 'noah.bergstrom@example.test',  '2026-02-20', 7),
  ('Aisha Bello',    'aisha.bello@example.test',     '2026-03-01', 4),
  ('Marco Rossi',    'marco.rossi@example.test',     '2026-03-05', NULL),
  ('Sophie Dubois',  'sophie.dubois@example.test',   '2026-03-10', 10),
  ('Kwame Mensah',   'kwame.mensah@example.test',    '2026-03-15', 6);

-- orders (1..26). employee_id: 4=Lukas, 5=Arjun, 6=Camila (sales reps), NULL = self-service.
INSERT INTO orders (customer_id, employee_id, status, created_at) VALUES
  (1,  4,    'paid',      '2026-06-15 10:00'),
  (2,  5,    'paid',      '2026-06-15 15:30'),
  (3,  6,    'paid',      '2026-06-16 11:00'),
  (4,  4,    'paid',      '2026-06-17 09:45'),
  (5,  NULL, 'pending',   '2026-06-18 14:20'),
  (6,  5,    'paid',      '2026-06-21 10:10'),
  (7,  6,    'paid',      '2026-06-22 12:00'),
  (8,  4,    'cancelled', '2026-06-22 16:40'),
  (9,  NULL, 'paid',      '2026-06-23 09:15'),
  (10, 5,    'paid',      '2026-06-24 13:50'),
  (11, 6,    'paid',      '2026-06-25 11:25'),
  (12, 4,    'paid',      '2026-06-26 10:05'),
  (1,  5,    'paid',      '2026-06-27 17:00'),
  (2,  6,    'paid',      '2026-06-29 09:30'),
  (3,  NULL, 'pending',   '2026-06-30 15:00'),
  (4,  4,    'paid',      '2026-07-01 10:20'),
  (5,  5,    'paid',      '2026-07-02 11:40'),
  (6,  6,    'paid',      '2026-07-06 09:00'),
  (7,  4,    'paid',      '2026-07-07 10:30'),
  (8,  5,    'paid',      '2026-07-07 16:15'),
  (9,  NULL, 'cancelled', '2026-07-08 12:50'),
  (10, 6,    'paid',      '2026-07-15 14:00'),
  (11, 4,    'paid',      '2026-07-20 09:20'),
  (12, 5,    'paid',      '2026-07-25 10:00'),
  (1,  6,    'paid',      '2026-07-25 15:45'),
  (2,  NULL, 'pending',   '2026-07-28 11:10');

-- order_items (one or two products per order; unit_price copies the product price at order time).
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1,  1,  1, 1299.99), (1,  4,  2,  25.50),
  (2,  6,  1,  799.00), (2,  8,  1,  12.99),
  (3,  10, 1,   65.00),
  (4,  14, 1,  189.00),
  (5,  17, 5,    9.99), (5, 18,  3,   6.50),
  (6,  2,  1,  999.50),
  (7,  7,  2,  399.00),
  (8,  12, 1,   45.00),
  (9,  19, 10,   4.25),
  (10, 15, 1,  349.00),
  (11, 3,  1,   89.90), (11, 5,  1, 249.00),
  (12, 9,  4,    8.50),
  (13, 11, 1,   89.00),
  (14, 13, 2,   32.00),
  (15, 20, 2,   14.75),
  (16, 1,  1, 1299.99),
  (17, 6,  1,  799.00),
  (18, 16, 1,  129.00),
  (19, 4,  3,   25.50),
  (20, 21, 1,   19.99),
  (21, 2,  1,  999.50),
  (22, 7,  1,  399.00),
  (23, 10, 2,   65.00),
  (24, 14, 1,  189.00),
  (25, 17, 10,   9.99),
  (26, 5,  1,  249.00);
