CREATE TABLE `shop160_db`.`sales` (
  `idsales` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(45) NULL,
  `type` ENUM('percen', 'same_amount', 'minus_amount') NOT NULL,
  `type_select` ENUM('product', 'category') NOT NULL,
  `array_select` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idsales`));

ALTER TABLE `shop160_db`.`sales` 
CHANGE COLUMN `status` `status` INT NULL DEFAULT 1 ;

ALTER TABLE `shop160_db`.`sales` 
CHANGE COLUMN `type` `type` ENUM('percen', 'same_amount', 'minus_amount') NOT NULL DEFAULT 'percen' ,
CHANGE COLUMN `type_select` `type_select` ENUM('product', 'category') NOT NULL DEFAULT 'product' ;

ALTER TABLE `shop160_db`.`sales` 
CHANGE COLUMN `idsales` `sales_id` INT NOT NULL ;
