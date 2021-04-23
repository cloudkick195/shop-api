-- MySQL dump 10.13  Distrib 5.7.27, for Linux (x86_64)
--
-- Host: localhost    Database: shop160_db
-- ------------------------------------------------------
-- Server version	5.7.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attr_entity_type`
--

DROP TABLE IF EXISTS `attr_entity_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attr_entity_type` (
  `id_entity_type` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `entity_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attr_id` bigint(20) unsigned NOT NULL,
  `is_archive` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_entity_type`),
  KEY `attr_id` (`attr_id`),
  CONSTRAINT `attr_entity_type_ibfk_1` FOREIGN KEY (`attr_id`) REFERENCES `product_attribute_entities` (`attribute_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attr_entity_type`
--

LOCK TABLES `attr_entity_type` WRITE;
/*!40000 ALTER TABLE `attr_entity_type` DISABLE KEYS */;
INSERT INTO `attr_entity_type` VALUES (1,'X',1,0,NULL,NULL),(2,'L',1,0,NULL,NULL),(3,'M',1,0,NULL,NULL),(4,'Green',2,0,NULL,NULL),(5,'Yellow',2,0,NULL,NULL);
/*!40000 ALTER TABLE `attr_entity_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `config_shipping`
--

DROP TABLE IF EXISTS `config_shipping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config_shipping` (
  `type` enum('normal','fast','receive','transfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` enum('default','province','district','ward','total','product','category','receive','transfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`type`,`key`,`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config_shipping`
--

LOCK TABLES `config_shipping` WRITE;
/*!40000 ALTER TABLE `config_shipping` DISABLE KEYS */;
INSERT INTO `config_shipping` VALUES ('normal','default','default',NULL,20000),('receive','receive','Thanh toán khi nhận hàng','Bạn cần thanh toán khi nhận hàng',0),('transfer','transfer','Chuyển tiền','Chuyển tiền vào khoản',0);
/*!40000 ALTER TABLE `config_shipping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer` (
  `customer_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `birth_day` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('M','F','O') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_temporary` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `remember_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `type` enum('normal','vip') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `phone_UNIQUE` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Le Tuan Anh','04/10/1996','M','tuananh@gmail.com','$2y$10$4EWiUWT66xD7egepjgC0Q.2Hy.tJqTBzubFNk9wvsir45UmrIO3O2 ','0336322777',NULL,'Viet Nam','2020-10-28 15:58:28',NULL,0,'normal'),(2,'Nguyễn Khánh Lệ','19/10/1996','F','tuananh2@gmail.com','$2a$10$q1.6UYDETRtsFdjSPluy.ONrshr6noX6j8TNfDalB6EaELCr2YGNS','033678912',NULL,NULL,'2020-11-05 15:36:50',NULL,0,'normal');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_feedbacks`
--

DROP TABLE IF EXISTS `customer_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_feedbacks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_process_image` bigint(20) unsigned DEFAULT NULL,
  `is_archive` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_customer_feedbacks_1_idx` (`id_process_image`),
  CONSTRAINT `fk_customer_feedbacks_1` FOREIGN KEY (`id_process_image`) REFERENCES `process_images` (`id_process_image`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_feedbacks`
--

LOCK TABLES `customer_feedbacks` WRITE;
/*!40000 ALTER TABLE `customer_feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `informations`
--

DROP TABLE IF EXISTS `informations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `informations` (
  `info_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `is_archive` tinyint(1) DEFAULT '0',
  `type` enum('text','image','description') DEFAULT 'text',
  `description` text,
  PRIMARY KEY (`info_id`),
  KEY `indexKey` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `informations`
--

LOCK TABLES `informations` WRITE;
/*!40000 ALTER TABLE `informations` DISABLE KEYS */;
/*!40000 ALTER TABLE `informations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `main_slides`
--

DROP TABLE IF EXISTS `main_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `main_slides` (
  `slide_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_process_image` bigint(20) DEFAULT NULL,
  `is_archive` tinyint(4) DEFAULT '0',
  `link` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`slide_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `main_slides`
--

LOCK TABLES `main_slides` WRITE;
/*!40000 ALTER TABLE `main_slides` DISABLE KEYS */;
/*!40000 ALTER TABLE `main_slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_folders`
--

DROP TABLE IF EXISTS `media_folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media_folders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` int(11) NOT NULL DEFAULT '0',
  `is_archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_folders`
--

LOCK TABLES `media_folders` WRITE;
/*!40000 ALTER TABLE `media_folders` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `order_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `customer_id` bigint(20) DEFAULT NULL,
  `customer_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_payment` enum('normal','fast','receive','transfer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'receive',
  `ship_type` enum('normal','fast') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `ship_address` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_price` int(11) DEFAULT NULL,
  `ship_date` datetime DEFAULT NULL,
  `ship_ward` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_description` text COLLATE utf8mb4_unicode_ci,
  `discount` int(11) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('process','complete','cancel') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'process',
  `tracking_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` int(11) NOT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `tracking_token_UNIQUE` (`tracking_token`),
  KEY `fk_order_customer_idx` (`customer_id`),
  KEY `fk_order_shipping_type_idx` (`ship_type`),
  KEY `fk_order_shipping_payment_idx` (`ship_payment`),
  CONSTRAINT `fk_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_shipping_payment` FOREIGN KEY (`ship_payment`) REFERENCES `config_shipping` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_shipping_type` FOREIGN KEY (`ship_type`) REFERENCES `config_shipping` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,1,'Tuan Anh','0336322777','receive','normal','197 385 Street, Tang Nhon Phu A Ward, District 9',20000,'2020-11-06 18:02:14','',NULL,0,'2020-11-07 06:27:01','process','',148000);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER status_update_product AFTER UPDATE ON `order`
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
	END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `order_detail`
--

DROP TABLE IF EXISTS `order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_detail` (
  `order_detail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `combination_id` bigint(20) unsigned DEFAULT NULL,
  `qty` int(10) unsigned NOT NULL,
  `product_price` int(11) NOT NULL,
  `product_old_price` int(11) NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_option` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`order_detail_id`),
  KEY `fk_order_detail_order` (`order_id`),
  KEY `fk_order_detail_product` (`product_id`),
  KEY `fk_order_detail_product_attribute_combinations` (`combination_id`),
  CONSTRAINT `fk_order_detail_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_detail_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_detail_product_attribute_combinations` FOREIGN KEY (`combination_id`) REFERENCES `product_attribute_combinations` (`combination_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_detail`
--

LOCK TABLES `order_detail` WRITE;
/*!40000 ALTER TABLE `order_detail` DISABLE KEYS */;
INSERT INTO `order_detail` VALUES (1,1,13,24,1,24000,24000,'LMAO',NULL,'https://res.cloudinary.com/tuananh-asia/image/upload/v1604607774/qkemadkw0fsmovasqmyk.jpg'),(2,1,12,23,2,50000,50000,'Google Plus',NULL,'https://res.cloudinary.com/tuananh-asia/image/upload/v1604607774/qkemadkw0fsmovasqmyk.jpg');
/*!40000 ALTER TABLE `order_detail` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER update_product AFTER INSERT ON order_detail
	FOR EACH ROW
	BEGIN
		IF(NEW.combination_id IS NULL) THEN
			UPDATE products SET count = count - NEW.qty WHERE product_id = NEW.product_id;
		ELSE
			UPDATE product_attribute_combinations SET count = count - NEW.qty WHERE product_id = NEW.product_id AND combination_id = NEW.combination_id;
		END IF;
        
	END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER before_update_product before update ON order_detail
	FOR EACH ROW
	BEGIN
		IF(NEW.combination_id IS NULL) THEN
			UPDATE products SET count = count + OLD.qty - NEW.qty 
            WHERE product_id = NEW.product_id;
		ELSE
            UPDATE product_attribute_combinations SET count = count + OLD.qty - NEW.qty
            WHERE product_id = NEW.product_id AND combination_id = NEW.combination_id;
		END IF;
	END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER delete_update_product BEFORE DELETE ON order_detail
	FOR EACH ROW
	BEGIN
		IF(OLD.combination_id IS NULL) THEN
			UPDATE products SET count = count + OLD.qty
            WHERE product_id = OLD.product_id;
		ELSE
            UPDATE product_attribute_combinations SET count = count + OLD.qty
            WHERE product_id = OLD.product_id AND combination_id = OLD.combination_id;
		END IF;
	END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policy_posts`
--

DROP TABLE IF EXISTS `policy_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `policy_posts` (
  `post_id` int(11) NOT NULL AUTO_INCREMENT,
  `post_slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_content` text COLLATE utf8mb4_unicode_ci,
  `post_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`post_id`),
  UNIQUE KEY `post_slug_UNIQUE` (`post_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policy_posts`
--

LOCK TABLES `policy_posts` WRITE;
/*!40000 ALTER TABLE `policy_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `policy_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `process_images`
--

DROP TABLE IF EXISTS `process_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `process_images` (
  `id_process_image` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `process_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver` int(11) DEFAULT '3',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `version` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `folder_id` bigint(20) NOT NULL DEFAULT '0',
  `is_archive` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_process_image`),
  UNIQUE KEY `process_images_process_key_uindex` (`process_key`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `process_images`
--

LOCK TABLES `process_images` WRITE;
/*!40000 ALTER TABLE `process_images` DISABLE KEYS */;
INSERT INTO `process_images` VALUES (1,'vuwknxexcz4mpmjqbldw','image/upload','vuwknxexcz4mpmjqbldw.jpg',3,NULL,NULL,'1604325574','09ed6f361722f483eb0cc90c9dd21820bee48f8b','image',0,0),(2,'nu0vaw7negnowi3hjhth','image/upload','nu0vaw7negnowi3hjhth.jpg',3,NULL,NULL,'1604325574','b5337603f5a5418b7c724650b30a8bb93c3ba075','image',0,0),(3,'sd1zc0fauhpgwzkirkoj','image/upload','sd1zc0fauhpgwzkirkoj.jpg',3,NULL,NULL,'1604325574','4d0e879ed237a8a5f494c5d0018e4f40251e3c09','image',0,0),(4,'ocgqjfexqp1xhiloeafi','image/upload','ocgqjfexqp1xhiloeafi.jpg',3,NULL,NULL,'1604325574','0c9fc4b6ca331e5075a3137a8346ceee8a03d473','image',0,0),(5,'tniqouuz0vdtjmov58ey','image/upload','tniqouuz0vdtjmov58ey.jpg',3,NULL,NULL,'1604605725','fd9444aa4dd7a4cd26bc1f47828e64472b67a375','image',0,0),(6,'ebgjrrbzqpjbczxbqzgu','image/upload','ebgjrrbzqpjbczxbqzgu.jpg',3,NULL,NULL,'1604605782','409d44f08ec5e8f4cca299c7999ebece02943622','image',0,0),(7,'yg5mzpjhbklgpjgbw7lf','image/upload','yg5mzpjhbklgpjgbw7lf.jpg',3,NULL,NULL,'1604605793','8d9d5562de807d22546b8231eee7e8880adec7f9','image',0,0),(8,'qkemadkw0fsmovasqmyk','image/upload','qkemadkw0fsmovasqmyk.jpg',3,NULL,NULL,'1604607774','d232ce3e8b8e9a7346461d176bb561e158b55567','image',0,0);
/*!40000 ALTER TABLE `process_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attribute_combinations`
--

DROP TABLE IF EXISTS `product_attribute_combinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_attribute_combinations` (
  `combination_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `process_image` bigint(20) unsigned DEFAULT NULL,
  `count` int(11) NOT NULL,
  `is_archive` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`combination_id`),
  KEY `product_attribute_combinations_product_id_foreign` (`product_id`),
  KEY `fk_product_attribute_combinations_1_idx` (`process_image`),
  CONSTRAINT `fk_product_attribute_combinations_1` FOREIGN KEY (`process_image`) REFERENCES `process_images` (`id_process_image`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `product_attribute_combinations_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attribute_combinations`
--

LOCK TABLES `product_attribute_combinations` WRITE;
/*!40000 ALTER TABLE `product_attribute_combinations` DISABLE KEYS */;
INSERT INTO `product_attribute_combinations` VALUES (1,1,3,15,0,NULL,NULL),(2,2,3,15,0,NULL,NULL),(3,9,2,15,0,NULL,NULL),(4,9,2,13,0,NULL,NULL),(5,10,2,15,0,NULL,NULL),(6,10,2,13,0,NULL,NULL),(7,11,2,15,0,NULL,NULL),(8,11,2,13,0,NULL,NULL),(9,12,2,35,1,'2020-11-05 21:01:58',NULL),(10,12,2,36,1,'2020-11-05 21:02:01',NULL),(11,12,6,37,1,'2020-11-05 21:02:07',NULL),(12,12,6,37,1,'2020-11-05 21:02:08',NULL),(13,12,6,37,1,'2020-11-05 21:02:10',NULL),(14,12,6,37,1,'2020-11-05 21:02:12',NULL),(15,12,6,37,1,'2020-11-05 21:02:14',NULL),(16,12,6,37,1,'2020-11-05 21:02:15',NULL),(17,12,6,37,1,'2020-11-05 21:02:16',NULL),(18,12,6,37,1,'2020-11-05 21:02:18',NULL),(19,12,6,37,1,'2020-11-05 21:02:19',NULL),(20,12,6,37,1,'2020-11-05 21:02:20',NULL),(21,12,6,37,1,'2020-11-05 21:02:22',NULL),(22,12,6,37,1,'2020-11-05 21:02:24',NULL),(23,12,6,35,1,'2020-11-06 18:17:12',NULL),(24,13,5,15,0,NULL,NULL);
/*!40000 ALTER TABLE `product_attribute_combinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attribute_entities`
--

DROP TABLE IF EXISTS `product_attribute_entities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_attribute_entities` (
  `attribute_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `attribute_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Etc: Color, Size, etc.',
  `is_archive` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`attribute_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attribute_entities`
--

LOCK TABLES `product_attribute_entities` WRITE;
/*!40000 ALTER TABLE `product_attribute_entities` DISABLE KEYS */;
INSERT INTO `product_attribute_entities` VALUES (1,'Size',0,NULL,NULL),(2,'Color',0,NULL,NULL),(3,'Yellow',1,NULL,NULL);
/*!40000 ALTER TABLE `product_attribute_entities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attribute_entity_background`
--

DROP TABLE IF EXISTS `product_attribute_entity_background`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_attribute_entity_background` (
  `id_attribute_entity_background` bigint(20) NOT NULL AUTO_INCREMENT,
  `process_image` bigint(20) unsigned DEFAULT NULL,
  `entity_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `is_archive` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_attribute_entity_background`,`entity_id`,`product_id`),
  KEY `fk_product_attribute_entity_background_1_idx` (`process_image`),
  KEY `fk_product_attribute_entity_background_2_idx` (`entity_id`),
  CONSTRAINT `fk_product_attribute_entity_background_1` FOREIGN KEY (`process_image`) REFERENCES `process_images` (`id_process_image`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_product_attribute_entity_background_2` FOREIGN KEY (`entity_id`) REFERENCES `attr_entity_type` (`id_entity_type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attribute_entity_background`
--

LOCK TABLES `product_attribute_entity_background` WRITE;
/*!40000 ALTER TABLE `product_attribute_entity_background` DISABLE KEYS */;
INSERT INTO `product_attribute_entity_background` VALUES (1,1,1,1,0),(2,2,4,1,0),(3,1,1,2,0),(4,2,4,2,0),(5,4,1,11,0),(6,3,4,11,0),(7,4,1,12,1),(8,2,4,12,0),(9,4,2,12,1),(10,1,5,12,1),(11,7,1,13,0),(12,4,4,13,0);
/*!40000 ALTER TABLE `product_attribute_entity_background` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attribute_entity_combinations`
--

DROP TABLE IF EXISTS `product_attribute_entity_combinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_attribute_entity_combinations` (
  `attribute_type_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `entity_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `combination_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`attribute_type_id`),
  KEY `product_attribute_entity_combinations___fk_3` (`combination_id`),
  KEY `product_attribute_entity_type_entity_id_foreign` (`entity_id`),
  KEY `product_attribute_entity_type_product_id_foreign` (`product_id`),
  CONSTRAINT `product_attribute_entity_combinations___fk_3` FOREIGN KEY (`combination_id`) REFERENCES `product_attribute_combinations` (`combination_id`),
  CONSTRAINT `product_attribute_entity_type_entity_id_foreign` FOREIGN KEY (`entity_id`) REFERENCES `attr_entity_type` (`id_entity_type`),
  CONSTRAINT `product_attribute_entity_type_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attribute_entity_combinations`
--

LOCK TABLES `product_attribute_entity_combinations` WRITE;
/*!40000 ALTER TABLE `product_attribute_entity_combinations` DISABLE KEYS */;
INSERT INTO `product_attribute_entity_combinations` VALUES (1,1,1,NULL,NULL,1),(2,4,1,NULL,NULL,1),(3,1,2,NULL,NULL,2),(4,4,2,NULL,NULL,2),(5,1,9,NULL,NULL,3),(6,4,9,NULL,NULL,3),(7,1,9,NULL,NULL,4),(8,4,9,NULL,NULL,4),(9,1,10,NULL,NULL,5),(10,4,10,NULL,NULL,5),(11,1,10,NULL,NULL,6),(12,4,10,NULL,NULL,6),(13,1,11,NULL,NULL,7),(14,4,11,NULL,NULL,7),(15,1,11,NULL,NULL,8),(16,4,11,NULL,NULL,8),(17,1,12,NULL,NULL,9),(18,4,12,NULL,NULL,9),(19,2,12,NULL,NULL,10),(20,5,12,NULL,NULL,10),(21,3,12,NULL,NULL,11),(22,4,12,NULL,NULL,11),(23,3,12,NULL,NULL,12),(24,4,12,NULL,NULL,12),(25,3,12,NULL,NULL,13),(26,4,12,NULL,NULL,13),(27,3,12,NULL,NULL,14),(28,4,12,NULL,NULL,14),(29,3,12,NULL,NULL,15),(30,4,12,NULL,NULL,15),(31,3,12,NULL,NULL,16),(32,4,12,NULL,NULL,16),(33,3,12,NULL,NULL,17),(34,4,12,NULL,NULL,17),(35,3,12,NULL,NULL,18),(36,4,12,NULL,NULL,18),(37,3,12,NULL,NULL,19),(38,4,12,NULL,NULL,19),(39,3,12,NULL,NULL,20),(40,4,12,NULL,NULL,20),(41,3,12,NULL,NULL,21),(42,4,12,NULL,NULL,21),(43,3,12,NULL,NULL,22),(44,4,12,NULL,NULL,22),(45,3,12,NULL,NULL,23),(46,4,12,NULL,NULL,23),(47,1,13,NULL,NULL,24),(48,4,13,NULL,NULL,24);
/*!40000 ALTER TABLE `product_attribute_entity_combinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_categories` (
  `product_category_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_process_image` bigint(20) unsigned DEFAULT NULL,
  `parent_id` bigint(20) NOT NULL DEFAULT '0',
  `is_archive` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` bigint(20) DEFAULT NULL,
  `archive_by` bigint(20) DEFAULT NULL,
  `is_show_in_home` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_category_id`,`parent_id`),
  UNIQUE KEY `product_categories_slug_uindex` (`slug`),
  KEY `product_categories_id_process_image_foreign` (`id_process_image`),
  CONSTRAINT `product_categories_id_process_image_foreign` FOREIGN KEY (`id_process_image`) REFERENCES `process_images` (`id_process_image`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Product','product',2,0,0,1,NULL,1,NULL,NULL,NULL,1),(2,'Jean','jean',4,1,0,1,NULL,1,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_slides`
--

DROP TABLE IF EXISTS `product_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_slides` (
  `product_slide_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `id_process_image` bigint(20) unsigned DEFAULT NULL,
  `is_archive` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_slide_id`),
  KEY `product_slides___fk_1` (`product_id`),
  CONSTRAINT `product_slides___fk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1 COMMENT='all slides for product';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_slides`
--

LOCK TABLES `product_slides` WRITE;
/*!40000 ALTER TABLE `product_slides` DISABLE KEYS */;
INSERT INTO `product_slides` VALUES (1,10,NULL,4,0),(2,10,NULL,3,0),(3,10,NULL,2,0),(4,11,NULL,4,0),(5,11,NULL,3,0),(6,11,NULL,2,0),(7,12,'qwd',3,0),(8,12,'qwdqwdqwd',4,0),(9,12,'qwdqwd',2,0),(10,12,NULL,8,0),(11,12,NULL,6,0),(12,12,NULL,8,0),(13,12,NULL,6,0),(14,12,NULL,8,0),(15,12,NULL,6,0),(16,12,NULL,8,0),(17,12,NULL,6,0),(18,12,NULL,8,0),(19,12,NULL,6,0),(20,12,NULL,8,0),(21,12,NULL,6,0),(22,12,NULL,8,0),(23,12,NULL,6,0),(24,12,NULL,8,0),(25,12,NULL,6,0),(26,12,NULL,8,0),(27,12,NULL,6,0),(28,12,NULL,8,0),(29,12,NULL,6,0),(30,13,NULL,8,0),(31,13,NULL,7,0);
/*!40000 ALTER TABLE `product_slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_whole_sale`
--

DROP TABLE IF EXISTS `product_whole_sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_whole_sale` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `min_qty` int(11) NOT NULL DEFAULT '0',
  `discount` int(11) NOT NULL DEFAULT '0',
  `archive_by` bigint(20) unsigned DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_whole_sale_archive_by_foreign` (`archive_by`),
  KEY `product_whole_sale_created_by_foreign` (`created_by`),
  KEY `product_whole_sale_product_id_foreign` (`product_id`),
  CONSTRAINT `product_whole_sale_archive_by_foreign` FOREIGN KEY (`archive_by`) REFERENCES `users` (`id`),
  CONSTRAINT `product_whole_sale_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `product_whole_sale_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_whole_sale`
--

LOCK TABLES `product_whole_sale` WRITE;
/*!40000 ALTER TABLE `product_whole_sale` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_whole_sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `product_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_process_image` bigint(20) unsigned DEFAULT NULL,
  `category_id` bigint(20) unsigned NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int(11) NOT NULL,
  `price_sale` int(11) NOT NULL DEFAULT '0',
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint(20) unsigned NOT NULL,
  `archive_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `count` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `products_archive_by_foreign` (`archive_by`),
  KEY `products_category_id_foreign` (`category_id`),
  KEY `products_created_by_foreign` (`created_by`),
  KEY `products_id_process_image_foreign` (`id_process_image`),
  CONSTRAINT `products_archive_by_foreign` FOREIGN KEY (`archive_by`) REFERENCES `users` (`id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`product_category_id`),
  CONSTRAINT `products_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Shoe',4,1,'shoe',5000,0,'Tasdasd','asdasda',1,NULL,NULL,NULL,'15'),(2,'Shoe',4,1,'shoe',5000,0,'Tasdasd','asdasda',1,NULL,NULL,NULL,'15'),(3,'Jean 2919',4,2,'jean-2919',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(4,'Jean 2919',4,2,'jean-2919',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(5,'Jean 2919',4,2,'jean-2919',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(6,'Jean 2919',4,2,'12312312',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(7,'Jean 2919',4,2,'123123122',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(8,'Jean 2919',4,2,'123123122124',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(9,'Jean 2919',4,2,'1afxcaasda',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(10,'Jean 2919',4,2,'ascacasqw12',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(11,'Jean 2919',4,2,'ascacasqw123',50000,12000,'TA123121','asndlasndlkas',1,NULL,NULL,NULL,'28'),(12,'Jean 19958123123',6,1,'jean-19958',35000,12,'TA1231112','asdasdasdwqeqwe',1,NULL,NULL,NULL,'44'),(13,'asdasdasdasd',7,1,'asdasdasd1231231',5151515,0,'ZC1231','qweqe',1,NULL,NULL,NULL,'15');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `role_id` int(11) NOT NULL DEFAULT '2',
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--


LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,1,'Tuan Anh','tuananh@gmail.com','2019-09-09 20:50:00','$2y$10$AcJjREwqMj7RUAZLWJDVreXScDoyaR/r8JM3n99Dd1t3D1cMWFBTe',NULL,'2019-09-09 20:50:00','2019-09-09 20:50:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-07  6:33:23
