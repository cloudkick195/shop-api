--
-- Tạo bảng sale
--
CREATE TABLE `shop160_db`.`sales` (
  `sale_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(45) NULL DEFAULT NULL,
  `type` ENUM('percen', 'same_amount', 'minus_amount') NOT NULL DEFAULT 'percen',
  `type_select` ENUM('all', 'product', 'category') NOT NULL DEFAULT 'all',
  `category_select` VARCHAR(255) NULL DEFAULT NULL,
  `product_select` VARCHAR(255) NULL DEFAULT NULL,
  `status` INT NULL DEFAULT '1',
  `value` INT NOT NULL,
  PRIMARY KEY (`sale_id`));

ALTER TABLE `shop160_db`.`sales` 
ADD COLUMN `prioritize` VARCHAR(45) NULL AFTER `value`,
ADD UNIQUE INDEX `prioritize_UNIQUE` (`prioritize` ASC);
;

ALTER TABLE `shop160_db`.`product_attribute_combinations` 
ADD COLUMN `combination_sku`  INT(3) NULL DEFAULT NULL AFTER `updated_at`;
