-- Нормализация значений поля category у товаров под текущий список категорий в админке

-- Худи
UPDATE "Product"
SET "category" = 'hoodies'
WHERE lower(trim("category")) IN ('hoodies', 'hoodie');

-- Футболки
UPDATE "Product"
SET "category" = 't-shirts'
WHERE lower(trim("category")) IN ('t-shirts', 'tshirt', 'tshirts', 'tee');

-- Штаны
UPDATE "Product"
SET "category" = 'pants'
WHERE lower(trim("category")) IN ('pants', 'trousers');

-- Аксессуары
UPDATE "Product"
SET "category" = 'accessories'
WHERE lower(trim("category")) IN ('accessories', 'accessory');


