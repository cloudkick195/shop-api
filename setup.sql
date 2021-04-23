-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: mysql
-- Thời gian đã tạo: Th10 29, 2019 lúc 03:29 PM
-- Phiên bản máy phục vụ: 5.7.28
-- Phiên bản PHP: 7.2.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `test_node`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attr_entity_type`
--

CREATE TABLE `attr_entity_type` (
  `id_entity_type` bigint(20) UNSIGNED NOT NULL,
  `entity_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2014_11_29_135410_create_table_process_images', 1),
(4, '2014_11_30_151927_create_product_categories_table', 1),
(5, '2018_11_15_153216_create_products_table', 1),
(6, '2018_11_16_134027_create_table_attr_entity_type', 1),
(7, '2018_11_16_154646_create_product_attribute_entities_table', 1),
(8, '2018_12_17_154655_create_product_attribute_entity_type_table', 1),
(9, '2019_11_10_154716_create_product_attribute_combinations_table', 1),
(10, '2019_11_17_154725_create_product_attribute_combination_types_table', 1),
(11, '2019_11_29_143459_create_product_whole_sale_table', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `process_images`
--

CREATE TABLE `process_images` (
  `id_process_image` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_process_image` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int(11) NOT NULL,
  `price_sale` int(11) NOT NULL DEFAULT '0',
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `archive_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_attribute_combinations`
--

CREATE TABLE `product_attribute_combinations` (
  `combination_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `count` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_attribute_combination_types`
--

CREATE TABLE `product_attribute_combination_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `combination_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_type_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_attribute_entities`
--

CREATE TABLE `product_attribute_entities` (
  `attribute_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Etc: Color, Size, etc.',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_attribute_entity_type`
--

CREATE TABLE `product_attribute_entity_type` (
  `attribute_type_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_id` bigint(20) UNSIGNED NOT NULL,
  `entity_id` bigint(20) UNSIGNED NOT NULL,
  `id_process_image` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_categories`
--

CREATE TABLE `product_categories` (
  `product_category_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_process_image` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) NOT NULL DEFAULT '0',
  `is_archive` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` bigint(20) DEFAULT NULL,
  `archive_by` bigint(20) DEFAULT NULL,
  `show_tooltip_background` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_whole_sale`
--

CREATE TABLE `product_whole_sale` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `min_qty` int(11) NOT NULL DEFAULT '0',
  `discount` int(11) NOT NULL DEFAULT '0',
  `archive_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `attr_entity_type`
--
ALTER TABLE `attr_entity_type`
  ADD PRIMARY KEY (`id_entity_type`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Chỉ mục cho bảng `process_images`
--
ALTER TABLE `process_images`
  ADD PRIMARY KEY (`id_process_image`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `products_id_process_image_foreign` (`id_process_image`),
  ADD KEY `products_created_by_foreign` (`created_by`),
  ADD KEY `products_archive_by_foreign` (`archive_by`),
  ADD KEY `products_category_id_foreign` (`category_id`);

--
-- Chỉ mục cho bảng `product_attribute_combinations`
--
ALTER TABLE `product_attribute_combinations`
  ADD PRIMARY KEY (`combination_id`),
  ADD KEY `product_attribute_combinations_product_id_foreign` (`product_id`);

--
-- Chỉ mục cho bảng `product_attribute_combination_types`
--
ALTER TABLE `product_attribute_combination_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_attribute_combination_types_combination_id_foreign` (`combination_id`),
  ADD KEY `product_attribute_combination_types_attribute_type_id_foreign` (`attribute_type_id`);

--
-- Chỉ mục cho bảng `product_attribute_entities`
--
ALTER TABLE `product_attribute_entities`
  ADD PRIMARY KEY (`attribute_id`);

--
-- Chỉ mục cho bảng `product_attribute_entity_type`
--
ALTER TABLE `product_attribute_entity_type`
  ADD PRIMARY KEY (`attribute_type_id`),
  ADD KEY `product_attribute_entity_type_attribute_id_foreign` (`attribute_id`),
  ADD KEY `product_attribute_entity_type_entity_id_foreign` (`entity_id`),
  ADD KEY `product_attribute_entity_type_id_process_image_foreign` (`id_process_image`),
  ADD KEY `product_attribute_entity_type_product_id_foreign` (`product_id`);

--
-- Chỉ mục cho bảng `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`product_category_id`),
  ADD KEY `product_categories_id_process_image_foreign` (`id_process_image`);

--
-- Chỉ mục cho bảng `product_whole_sale`
--
ALTER TABLE `product_whole_sale`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_whole_sale_product_id_foreign` (`product_id`),
  ADD KEY `product_whole_sale_archive_by_foreign` (`archive_by`),
  ADD KEY `product_whole_sale_created_by_foreign` (`created_by`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `attr_entity_type`
--
ALTER TABLE `attr_entity_type`
  MODIFY `id_entity_type` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `process_images`
--
ALTER TABLE `process_images`
  MODIFY `id_process_image` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `product_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_attribute_combinations`
--
ALTER TABLE `product_attribute_combinations`
  MODIFY `combination_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_attribute_combination_types`
--
ALTER TABLE `product_attribute_combination_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_attribute_entities`
--
ALTER TABLE `product_attribute_entities`
  MODIFY `attribute_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_attribute_entity_type`
--
ALTER TABLE `product_attribute_entity_type`
  MODIFY `attribute_type_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `product_category_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_whole_sale`
--
ALTER TABLE `product_whole_sale`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_archive_by_foreign` FOREIGN KEY (`archive_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`product_category_id`),
  ADD CONSTRAINT `products_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `products_id_process_image_foreign` FOREIGN KEY (`id_process_image`) REFERENCES `process_images` (`id_process_image`);

--
-- Các ràng buộc cho bảng `product_attribute_combinations`
--
ALTER TABLE `product_attribute_combinations`
  ADD CONSTRAINT `product_attribute_combinations_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Các ràng buộc cho bảng `product_attribute_combination_types`
--
ALTER TABLE `product_attribute_combination_types`
  ADD CONSTRAINT `product_attribute_combination_types_attribute_type_id_foreign` FOREIGN KEY (`attribute_type_id`) REFERENCES `product_attribute_entity_type` (`attribute_type_id`),
  ADD CONSTRAINT `product_attribute_combination_types_combination_id_foreign` FOREIGN KEY (`combination_id`) REFERENCES `product_attribute_combinations` (`combination_id`);

--
-- Các ràng buộc cho bảng `product_attribute_entity_type`
--
ALTER TABLE `product_attribute_entity_type`
  ADD CONSTRAINT `product_attribute_entity_type_attribute_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `product_attribute_entities` (`attribute_id`),
  ADD CONSTRAINT `product_attribute_entity_type_entity_id_foreign` FOREIGN KEY (`entity_id`) REFERENCES `attr_entity_type` (`id_entity_type`),
  ADD CONSTRAINT `product_attribute_entity_type_id_process_image_foreign` FOREIGN KEY (`id_process_image`) REFERENCES `process_images` (`id_process_image`),
  ADD CONSTRAINT `product_attribute_entity_type_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Các ràng buộc cho bảng `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `product_categories_id_process_image_foreign` FOREIGN KEY (`id_process_image`) REFERENCES `process_images` (`id_process_image`);

alter table attr_entity_type
	add attr_id bigint unsigned not null;


alter table attr_entity_type ADD FOREIGN KEY (attr_id) REFERENCES `product_attribute_entities` (attribute_id)



alter table product_attribute_entity_type drop foreign key product_attribute_entity_type_attribute_id_foreign;

alter table product_attribute_entity_type drop column attribute_id;

alter table product_categories modify id_process_image bigint unsigned default null null;

create unique index product_categories_slug_uindex on product_categories (slug);
alter table process_images
	add path varchar(255) not null after id_process_image;

alter table process_images
	add file_name varchar(255) not null after path;

alter table process_images
	add driver int default 3 null after file_name;
alter table product_categories
	add updated_by bigint default null null;
alter table product_categories
	add position int default 0 not null;
alter table process_images
  add process_key varchar(255) null after id_process_image;

create unique index process_images_process_key_uindex
  on process_images (process_key);

alter table process_images
  add version varchar(255) null;

alter table process_images
  add signature varchar(255) null;

alter table process_images
  add resource_type varchar(255) null;
  alter table attr_entity_type
  	add is_archive tinyint(1) default 0 not null;
alter table attr_entity_type modify attr_id bigint unsigned not null after entity_name;

alter table attr_entity_type modify is_archive boolean default 0 not null after attr_id;
alter table product_attribute_entities
	add is_archive boolean default false not null after attribute_name;
alter table products modify id_process_image bigint unsigned null;
alter table products drop foreign key products_id_process_image_foreign;
alter table product_attribute_combinations
	add is_archive boolean default false not null after count;


CREATE TABLE `shop160_db`.`main_slides` (
  `slide_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `id_process_image` BIGINT(20) NULL DEFAULT NULL,
  `is_archive` TINYINT NULL DEFAULT 0,
  `link` VARCHAR(191) NULL DEFAULT NULL,
  PRIMARY KEY (`slide_id`));

--
-- Các ràng buộc cho bảng `product_whole_sale`
--
ALTER TABLE `product_whole_sale`
  ADD CONSTRAINT `product_whole_sale_archive_by_foreign` FOREIGN KEY (`archive_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `product_whole_sale_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `product_whole_sale_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;





ALTER TABLE `product_attribute_entities` ADD COLUMN `have_entity_avatar` TINYINT(1) DEFAULT 0