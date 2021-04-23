create table migrations
(
	id int unsigned auto_increment
		primary key,
	migration varchar(255) not null,
	batch int not null
)
collate=utf8mb4_unicode_ci;

create table password_resets
(
	email varchar(255) not null,
	token varchar(255) not null,
	created_at timestamp null
)
collate=utf8mb4_unicode_ci;

create index password_resets_email_index
	on password_resets (email);

create table process_images
(
	id_process_image bigint unsigned auto_increment
		primary key,
	process_key varchar(255) null,
	path varchar(255) not null,
	file_name varchar(255) not null,
	driver int default 3 null,
	created_at timestamp null,
	updated_at timestamp null,
	version varchar(255) null,
	signature varchar(255) null,
	resource_type varchar(255) null,
	constraint process_images_process_key_uindex
		unique (process_key)
)
collate=utf8mb4_unicode_ci;

create table product_attribute_entities
(
	attribute_id bigint unsigned auto_increment
		primary key,
	attribute_name varchar(255) not null comment 'Etc: Color, Size, etc.',
	is_archive tinyint(1) default 0 not null,
	created_at timestamp null,
	updated_at timestamp null
)
collate=utf8mb4_unicode_ci;

create table attr_entity_type
(
	id_entity_type bigint unsigned auto_increment
		primary key,
	entity_name varchar(255) not null,
	attr_id bigint unsigned not null,
	is_archive tinyint(1) default 0 not null,
	created_at timestamp null,
	updated_at timestamp null,
	constraint attr_entity_type_ibfk_1
		foreign key (attr_id) references product_attribute_entities (attribute_id)
)
collate=utf8mb4_unicode_ci;

create index attr_id
	on attr_entity_type (attr_id);

create table product_categories
(
	product_category_id bigint unsigned auto_increment
		primary key,
	name varchar(255) not null,
	slug varchar(255) not null,
	id_process_image bigint unsigned null,
	parent_id bigint default 0 not null,
	is_archive tinyint(1) default 0 not null,
	created_by bigint null,
	archive_by bigint null,
	is_show_in_home tinyint(1) default 0 not null,
	created_at timestamp null,
	updated_at timestamp null,
	updated_by bigint null,
	position int default 0 not null,
	constraint product_categories_slug_uindex
		unique (slug),
	constraint product_categories_id_process_image_foreign
		foreign key (id_process_image) references process_images (id_process_image)
)
collate=utf8mb4_unicode_ci;

create table users
(
	role_id int default 2 not null,
	id bigint unsigned auto_increment
		primary key,
	name varchar(255) not null,
	email varchar(255) not null,
	email_verified_at timestamp null,
	password varchar(255) not null,
	remember_token varchar(100) null,
	created_at timestamp null,
	updated_at timestamp null,
	constraint users_email_unique
		unique (email)
)
collate=utf8mb4_unicode_ci;

create table products
(
	product_id bigint unsigned auto_increment
		primary key,
	name varchar(255) not null,
	id_process_image bigint unsigned null,
	category_id bigint unsigned not null,
	slug varchar(255) not null,
	price int not null,
	price_sale int default 0 not null,
	sku varchar(255) null,
	description text null,
	created_by bigint unsigned not null,
	archive_by bigint unsigned null,
	created_at timestamp null,
	updated_at timestamp null,
	constraint products_archive_by_foreign
		foreign key (archive_by) references users (id),
	constraint products_category_id_foreign
		foreign key (category_id) references product_categories (product_category_id),
	constraint products_created_by_foreign
		foreign key (created_by) references users (id)
)
collate=utf8mb4_unicode_ci;

create table product_attribute_combinations
(
	combination_id bigint unsigned auto_increment
		primary key,
	product_id bigint unsigned not null,
	count int not null,
	is_archive tinyint(1) default 0 not null,
	created_at timestamp null,
	updated_at timestamp null,
	constraint product_attribute_combinations_product_id_foreign
		foreign key (product_id) references products (product_id)
)
collate=utf8mb4_unicode_ci;

create table product_attribute_entity_combinations
(
	attribute_type_id bigint unsigned auto_increment
		primary key,
	entity_id bigint unsigned not null,
	id_process_image bigint unsigned null,
	product_id bigint unsigned not null,
	created_at timestamp null,
	updated_at timestamp null,
	combination_id bigint unsigned null,
	constraint product_attribute_entity_combinations___fk_3
		foreign key (combination_id) references product_attribute_combinations (combination_id),
	constraint product_attribute_entity_type_entity_id_foreign
		foreign key (entity_id) references attr_entity_type (id_entity_type),
	constraint product_attribute_entity_type_id_process_image_foreign
		foreign key (id_process_image) references process_images (id_process_image),
	constraint product_attribute_entity_type_product_id_foreign
		foreign key (product_id) references products (product_id)
)
collate=utf8mb4_unicode_ci;

create table product_slides
(
	product_slide_id bigint unsigned auto_increment
		primary key,
	product_id bigint unsigned not null,
	link varchar(255) null,
	id_process_image bigint unsigned null,
	is_archive tinyint(1) default 0 not null,
	constraint product_slides___fk_1
		foreign key (product_id) references products (product_id)
)
comment 'all slides for product';

create table product_whole_sale
(
	id bigint unsigned auto_increment
		primary key,
	product_id bigint unsigned not null,
	min_qty int default 0 not null,
	discount int default 0 not null,
	archive_by bigint unsigned null,
	created_by bigint unsigned not null,
	created_at timestamp null,
	updated_at timestamp null,
	constraint product_whole_sale_archive_by_foreign
		foreign key (archive_by) references users (id),
	constraint product_whole_sale_created_by_foreign
		foreign key (created_by) references users (id),
	constraint product_whole_sale_product_id_foreign
		foreign key (product_id) references products (product_id)
)
collate=utf8mb4_unicode_ci;
create index products_id_process_image_foreign
	on products (id_process_image);
CREATE TABLE `shop160_db`.`main_slides` (
  `slide_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `id_process_image` BIGINT(20) NULL DEFAULT NULL,
  `is_archive` TINYINT NULL DEFAULT 0,
  `link` VARCHAR(191) NULL DEFAULT NULL,
  PRIMARY KEY (`slide_id`));
  
CREATE TABLE `shop160_db`.`informations` (
  `info_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(255) NOT NULL,
  `value` VARCHAR(255) NULL DEFAULT NULL,
  `is_archive` TINYINT(1) NULL DEFAULT 0,
  PRIMARY KEY (`info_id`),
  INDEX `indexKey` (`key` ASC));
ALTER TABLE `shop160_db`.`informations` 
ADD COLUMN `type` ENUM('text', 'image') NULL DEFAULT 'text' AFTER `is_archive`;

CREATE TABLE `shop160_db`.`customer_feedbacks` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `id_process_image` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
  `is_archive` TINYINT NULL DEFAULT 0,
  PRIMARY KEY (`id`));
ALTER TABLE `shop160_db`.`customer_feedbacks` 
ADD INDEX `fk_customer_feedbacks_1_idx` (`id_process_image` ASC);
ALTER TABLE `shop160_db`.`customer_feedbacks` 
ADD CONSTRAINT `fk_customer_feedbacks_1`
  FOREIGN KEY (`id_process_image`)
  REFERENCES `shop160_db`.`process_images` (`id_process_image`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
ALTER TABLE `shop160_db`.`products` 
ADD COLUMN `count` VARCHAR(45) NULL AFTER `updated_at`;

INSERT INTO `shop160_db`.`users` (`role_id`, `id`, `name`, `email`, `email_verified_at`, `password`, `created_at`, `updated_at`) VALUES ('3', '1', 'Tuan Anh', 'tuananh@gmail.com', '2019-09-09 20:50:00', '$2y$10$AcJjREwqMj7RUAZLWJDVreXScDoyaR/r8JM3n99Dd1t3D1cMWFBTe', '2019-09-09 20:50:00', '2019-09-09 20:50:00');


ALTER SCHEMA `shop160_db`  DEFAULT CHARACTER SET utf8mb4  DEFAULT COLLATE utf8mb4_unicode_ci ;

ALTER TABLE `shop160_db`.`informations` 
CHANGE COLUMN `value` `value` VARCHAR(255) CHARACTER SET 'utf8mb4' NULL DEFAULT NULL ;


ALTER TABLE `shop160_db`.`product_categories` 
DROP PRIMARY KEY,
ADD PRIMARY KEY (`product_category_id`, `parent_id`);
ALTER TABLE `shop160_db`.`product_attribute_combinations` 
DROP PRIMARY KEY,
ADD PRIMARY KEY (`combination_id`, `product_id`);

CREATE TABLE `shop160_db`.`product_attribute_entity_background` (
  `id_attribute_entity_background` BIGINT(20) NOT NULL,
  `process_image` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
  `entity_id` BIGINT(20) UNSIGNED NOT NULL,
  `product_id` BIGINT(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`id_attribute_entity_background`, `entity_id`, `product_id`),
  INDEX `fk_product_attribute_entity_background_1_idx` (`process_image` ASC),
  INDEX `fk_product_attribute_entity_background_2_idx` (`entity_id` ASC),
  CONSTRAINT `fk_product_attribute_entity_background_1`
    FOREIGN KEY (`process_image`)
    REFERENCES `shop160_db`.`process_images` (`id_process_image`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_product_attribute_entity_background_2`
    FOREIGN KEY (`entity_id`)
    REFERENCES `shop160_db`.`attr_entity_type` (`id_entity_type`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
ALTER TABLE `shop160_db`.`product_attribute_combinations` 
ADD COLUMN `process_image` BIGINT(20) UNSIGNED NULL DEFAULT NULL AFTER `product_id`,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`combination_id`),
ADD INDEX `fk_product_attribute_combinations_1_idx` (`process_image` ASC);
ALTER TABLE `shop160_db`.`product_attribute_combinations` 
ADD CONSTRAINT `fk_product_attribute_combinations_1`
  FOREIGN KEY (`process_image`)
  REFERENCES `shop160_db`.`process_images` (`id_process_image`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `shop160_db`.`product_attribute_entity_combinations` 
DROP FOREIGN KEY `product_attribute_entity_type_id_process_image_foreign`;
ALTER TABLE `shop160_db`.`product_attribute_entity_combinations` 
DROP COLUMN `id_process_image`,
DROP INDEX `product_attribute_entity_type_id_process_image_foreign` ;

ALTER TABLE `shop160_db`.`product_attribute_entity_background` 
CHANGE COLUMN `id_attribute_entity_background` `id_attribute_entity_background` BIGINT(20) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `shop160_db`.`product_attribute_entity_background` 
ADD COLUMN `is_archive` TINYINT NOT NULL DEFAULT 0 AFTER `product_id`;

ALTER TABLE `shop160_db`.`informations` 
CHANGE COLUMN `type` `type` ENUM('text', 'image', 'description') NULL DEFAULT 'text' ,
ADD COLUMN `description` TEXT NULL AFTER `type`;


CREATE TABLE `shop160_db`.`order` (
  `order_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT(20) NULL,
  `customer_name` VARCHAR(200) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
   `ship_payment` ENUM('normal', 'fast','receive', 'transfer') NOT NULL DEFAULT 'receive',
  `ship_type` ENUM('normal', 'fast') NOT NULL DEFAULT 'normal',
  `ship_address` VARCHAR(120) NOT NULL,
  `ship_price` INT(11) NULL,
  `ship_date` DATETIME NULL,
  `ship_ward` VARCHAR(20) NOT NULL,
  `order_description` TEXT NULL,
  `discount` INT(11) NULL,
  `order_date` TIMESTAMP NOT NULL,
  `status` ENUM('process', 'complete', 'cancel') NOT NULL DEFAULT 'process',
  `tracking_token` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE INDEX `tracking_token_UNIQUE` (`tracking_token` ASC));


CREATE TABLE `shop160_db`.`order_detail` (
	`order_detail_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT(20) NOT NULL,
  `product_id` BIGINT(20) UNSIGNED NOT NULL,
  `combination_id` BIGINT(20) UNSIGNED NULL,
  `qty` INT UNSIGNED NOT NULL,
  `product_price` INT(11) NOT NULL,
  `product_old_price` INT(11) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_option` VARCHAR(100) NULL,
  `avatar` VARCHAR(255) NULL,PRIMARY KEY (`order_detail_id`));


ALTER TABLE `shop160_db`.`order_detail` 
ADD CONSTRAINT `fk_order_detail_order`
  FOREIGN KEY (`order_id`)
  REFERENCES `shop160_db`.`order` (`order_id`)
  ON DELETE CASCADE
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_order_detail_product`
  FOREIGN KEY (`product_id`)
  REFERENCES `shop160_db`.`products` (`product_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
ALTER TABLE `shop160_db`.`order_detail` 
ADD CONSTRAINT `fk_order_detail_product_attribute_combinations`
  FOREIGN KEY (`combination_id`)
  REFERENCES `shop160_db`.`product_attribute_combinations` (`combination_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

DROP TRIGGER IF EXISTS update_product;
DELIMITER $$

CREATE TRIGGER update_product AFTER INSERT ON order_detail
	FOR EACH ROW
	BEGIN
		IF(NEW.combination_id IS NULL) THEN
			UPDATE products SET count = count - NEW.qty WHERE product_id = NEW.product_id;
		ELSE
			UPDATE product_attribute_combinations SET count = count - NEW.qty WHERE product_id = NEW.product_id AND combination_id = NEW.combination_id;
		END IF;
        
	END$$
DELIMITER ;

DROP TRIGGER IF EXISTS before_update_product;
DELIMITER $$

CREATE TRIGGER before_update_product before update ON order_detail
	FOR EACH ROW
	BEGIN
		IF(NEW.combination_id IS NULL) THEN
			UPDATE products SET count = count + OLD.qty - NEW.qty 
            WHERE product_id = NEW.product_id;
		ELSE
            UPDATE product_attribute_combinations SET count = count + OLD.qty - NEW.qty
            WHERE product_id = NEW.product_id AND combination_id = NEW.combination_id;
		END IF;
	END$$
DELIMITER ;

DROP TRIGGER IF EXISTS delete_update_product;
DELIMITER $$

CREATE TRIGGER delete_update_product BEFORE DELETE ON order_detail
	FOR EACH ROW
	BEGIN
		IF(OLD.combination_id IS NULL) THEN
			UPDATE products SET count = count + OLD.qty
            WHERE product_id = OLD.product_id;
		ELSE
            UPDATE product_attribute_combinations SET count = count + OLD.qty
            WHERE product_id = OLD.product_id AND combination_id = OLD.combination_id;
		END IF;
	END$$
DELIMITER ;

DROP TRIGGER IF EXISTS status_update_product;
DELIMITER $$

CREATE TRIGGER status_update_product AFTER UPDATE ON `order`
	FOR EACH ROW
	BEGIN
		DECLARE done INT DEFAULT FALSE;
		DECLARE productId, combinationId, qtyCount INT(10);
		DECLARE cur1_order_detail CURSOR FOR SELECT product_id, combination_id, qty FROM order_detail;
		DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
        OPEN cur1_order_detail;
		IF(NEW.`status` = 'cancel' AND OLD.`status` in ('process', 'complete')) THEN
			read_loop: LOOP
				FETCH cur1_order_detail INTO productId, combinationId, qtyCount;
				IF done THEN
				  LEAVE read_loop;
				END IF;
                
				IF (combinationId is null) THEN
				  UPDATE products SET count = count + qtyCount WHERE product_id = productId;
				ELSE
				  UPDATE product_attribute_combinations SET count = count + qtyCount WHERE product_id = productId AND combination_id = combinationId;
				END IF;
                
			END LOOP;
		ELSEIF(OLD.`status` = 'cancel' AND NEW.`status` in ('process', 'complete')) THEN
			read_loop: LOOP
				FETCH cur1_order_detail INTO productId, combinationId, qtyCount;
				IF done THEN
				  LEAVE read_loop;
				END IF;
                
				IF (combinationId is null) THEN
				  UPDATE products SET count = count - qtyCount WHERE product_id = productId;
				ELSE
				  UPDATE product_attribute_combinations SET count = count - qtyCount WHERE product_id = productId AND combination_id = combinationId;
				END IF;
			END LOOP;
		END IF;
		CLOSE cur1_order_detail;
	END$$
DELIMITER ;




CREATE TABLE `shop160_db`.`customer` (
  `customer_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `birth_day` DATETIME NULL,
  `gender` ENUM('M', 'F', 'O') NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `phone_temporary` VARCHAR(20) NULL,
  `address` TEXT NULL,
  `creation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `remember_token` VARCHAR(255) NULL,
  `status` TINYINT(1) NOT NULL default '0',
  `type` ENUM('normal', 'vip') NOT NULL DEFAULT 'normal',
  PRIMARY KEY (`customer_id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  UNIQUE INDEX `phone_UNIQUE` (`phone` ASC));
  ALTER TABLE `shop160_db`.`order` 
ADD INDEX `fk_order_customer_idx` (`customer_id` ASC);

ALTER TABLE `shop160_db`.`order` 
ADD CONSTRAINT `fk_order_customer`
  FOREIGN KEY (`customer_id`)
  REFERENCES `shop160_db`.`customer` (`customer_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
ALTER TABLE `shop160_db`.`order` 
ADD CONSTRAINT `fk_order_ward`
  FOREIGN KEY (`ship_ward`)
  REFERENCES `shop160_db`.`ward` (`wardid`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

  CREATE TABLE `shop160_db`.`config_shipping` (
  `type` ENUM('normal', 'fast','receive', 'transfer') NOT NULL,
  `key` ENUM('default', 'province', 'district', 'ward', 'total', 'product', 'category','receive', 'transfer') NOT NULL,
  `value` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `price` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`type`,`key`,`value`));
  

  ALTER TABLE `shop160_db`.`order` 
ADD INDEX `fk_order_shipping_type_idx` (`ship_type` ASC),
ADD INDEX `fk_order_shipping_payment_idx` (`ship_payment` ASC);
ALTER TABLE `shop160_db`.`order` 
ADD CONSTRAINT `fk_order_shipping_type`
  FOREIGN KEY (`ship_type`)
  REFERENCES `shop160_db`.`config_shipping` (`type`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_order_shipping_payment`
  FOREIGN KEY (`ship_payment`)
  REFERENCES `shop160_db`.`config_shipping` (`type`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

INSERT INTO `shop160_db`.`config_shipping` (`type`, `key`, `value`, `price`) VALUES ('normal', 'default', 'default', '20000');
INSERT INTO `shop160_db`.`config_shipping` (`type`, `key`, `value`, `description`) VALUES ('receive', 'receive', 'Thanh toán khi nhận hàng', 'Bạn cần thanh toán khi nhận hàng');
INSERT INTO `shop160_db`.`config_shipping` (`type`, `key`, `value`, `description`) VALUES ('transfer', 'transfer', 'Chuyển tiền', 'Chuyển tiền vào khoản');


CREATE TABLE `shop160_db`.`policy_posts` (
  `post_id` INT NOT NULL AUTO_INCREMENT,
  `post_slug` VARCHAR(255) NOT NULL,
  `post_content` VARCHAR(45) NULL,
  `post_name` VARCHAR(255) NULL DEFAULT NULL,
  `is_archive` TINYINT(1) NULL DEFAULT 0,
  PRIMARY KEY (`post_id`),
  UNIQUE INDEX `post_slug_UNIQUE` (`post_slug` ASC));
  ALTER TABLE `shop160_db`.`policy_posts`
  CHANGE COLUMN `post_content` `post_content` TEXT COLLATE 'utf8mb4_unicode_ci' NULL DEFAULT NULL ;

CREATE TABLE `media_folders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` int(11) NOT NULL DEFAULT '0',
  `is_archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `shop160_db`.`process_images` 
ADD COLUMN `folder_id` BIGINT(20) NOT NULL DEFAULT 0 AFTER `resource_type`;

ALTER TABLE `shop160_db`.`process_images` 
ADD COLUMN `is_archive` TINYINT NOT NULL AFTER `folder_id`;
ALTER TABLE `shop160_db`.`process_images` 
CHANGE COLUMN `is_archive` `is_archive` TINYINT NOT NULL DEFAULT 0 ;

CREATE TABLE `shop160_db`.`post` (
  `post_id` BIGINT(20) UNSIGNED NOT NULL,
  `post_title` VARCHAR(255) NOT NULL,
  `id_process_image` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
  `category_id` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `summary` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `archive_by` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
  `created_by` BIGINT(20) UNSIGNED NOT NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` VARCHAR(255) NULL,
  `seo_keyword` VARCHAR(255) NULL,
  PRIMARY KEY (`post_id`))
ENGINE = InnoDB;

CREATE TABLE `shop160_db`.`category` (
  `id` BIGINT(20) UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `id_process_image` BIGINT(20) NULL,
  `parent_id` BIGINT(20) NOT NULL DEFAULT 0,
  `is_archive` TINYINT(1) NULL DEFAULT 0,
  `created_by` BIGINT(20) NULL DEFAULT NULL,
  `archive_by` BIGINT(20) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL,
  `updated_by` BIGINT(20) NULL DEFAULT NULL,
  PRIMARY KEY (`category_id`));
  
  ALTER TABLE `shop160_db`.`post` 
CHANGE COLUMN `category_id` `category_id` BIGINT(20) UNSIGNED NOT NULL ;
ALTER TABLE `shop160_db`.`post` 
ADD CONSTRAINT `post_image`
  FOREIGN KEY (`id_process_image`)
  REFERENCES `shop160_db`.`process_images` (`id_process_image`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `shop160_db`.`post` 
CHARACTER SET = DEFAULT ;

ALTER TABLE `shop160_db`.`post` 
ADD INDEX `post_category_idx` (`category_id` ASC);
;
ALTER TABLE `shop160_db`.`post` 
ADD CONSTRAINT `post_category`
  FOREIGN KEY (`category_id`)
  REFERENCES `shop160_db`.`category` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
ALTER TABLE `shop160_db`.`category` 
CHANGE COLUMN `id_process_image` `id_process_image` BIGINT(20) UNSIGNED NULL DEFAULT NULL ;

ALTER TABLE `shop160_db`.`category` 
ADD INDEX `category_image_idx` (`id_process_image` ASC);
;
ALTER TABLE `shop160_db`.`category` 
ADD CONSTRAINT `category_image`
  FOREIGN KEY (`id_process_image`)
  REFERENCES `shop160_db`.`process_images` (`id_process_image`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `shop160_db`.`post` 
ADD INDEX `post_user_idx` (`created_by` ASC);
;
ALTER TABLE `shop160_db`.`post` 
ADD CONSTRAINT `post_user`
  FOREIGN KEY (`created_by`)
  REFERENCES `shop160_db`.`users` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;



