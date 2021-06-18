CREATE TABLE `shop160_db`.`post_category` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `id_process_image` BIGINT NULL DEFAULT NULL,
  `parent_id` BIGINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `shop160_db`.`post_category` 
CHANGE COLUMN `id` `id` BIGINT UNSIGNED NOT NULL ,
CHANGE COLUMN `id_process_image` `id_process_image` BIGINT UNSIGNED NULL DEFAULT NULL ;

ALTER TABLE `shop160_db`.`post_category` 
ADD CONSTRAINT `post_category_image`
  FOREIGN KEY (`id_process_image`)
  REFERENCES `shop160_db`.`process_images` (`id_process_image`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `shop160_db`.`post_category` 
ADD COLUMN `created_by` BIGINT NULL DEFAULT NULL AFTER `updated_at`,
CHANGE COLUMN `id` `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT ;

CREATE TABLE `shop160_db`.`post` (
  `post_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `id_process_image` BIGINT UNSIGNED NULL DEFAULT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `summary` TEXT NULL DEFAULT NULL,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL DEFAULT NULL,
  `seo_keyword` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`post_id`));

ALTER TABLE `shop160_db`.`post` 
ADD INDEX `post_created_by_foreign_idx` (`created_by` ASC) VISIBLE,
ADD INDEX `post_category_id_foreign_idx` (`category_id` ASC) VISIBLE;
;
ALTER TABLE `shop160_db`.`post` 
ADD CONSTRAINT `post_created_by_foreign`
  FOREIGN KEY (`created_by`)
  REFERENCES `shop160_db`.`users` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `post_category_id_foreign`
  FOREIGN KEY (`category_id`)
  REFERENCES `shop160_db`.`post_category` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

  ALTER TABLE `shop160_db`.`post` 
ADD COLUMN `archive_by` BIGINT UNSIGNED NULL DEFAULT NULL AFTER `created_by`;

ALTER TABLE `shop160_db`.`post` 
ADD INDEX `post_archive_by_foreign_idx` (`archive_by` ASC) VISIBLE;
;
ALTER TABLE `shop160_db`.`post` 
ADD CONSTRAINT `post_archive_by_foreign`
  FOREIGN KEY (`archive_by`)
  REFERENCES `shop160_db`.`users` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `shop160_db`.`post_category` 
ADD COLUMN `archive_by` BIGINT NULL DEFAULT NULL AFTER `created_by`;

ALTER TABLE `shop160_db`.`post_category` 
RENAME TO  `shop160_db`.`post_categories` ;
ALTER TABLE `shop160_db`.`post_categories` 
ADD COLUMN `position` INT NOT NULL DEFAULT '0' AFTER `archive_by`;

ALTER TABLE `shop160_db`.`post_categories` 
CHANGE COLUMN `id` `product_category_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT ;

ALTER TABLE `shop160_db`.`post_categories` 
CHANGE COLUMN `product_category_id` `post_category_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT ;

ALTER TABLE `shop160_db`.`post` 
RENAME TO  `shop160_db`.`posts` ;


ALTER TABLE `shop160_db`.`posts` 
CHANGE COLUMN `created_at` `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ;
