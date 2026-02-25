/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

USE `watch_store`;

-- ============================================
-- 1. BRANDS TABLE
-- ============================================
INSERT INTO `brands` (`id`, `name`, `description`, `logo_url`) VALUES
(1, 'Rolex', 'Thương hiệu đồng hồ cao cấp Thụy Sĩ', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Rolex_logo.svg/200px-Rolex_logo.svg.png'),
(2, 'Casio', 'Đồng hồ điện tử Nhật Bản', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Casio_logo.svg/200px-Casio_logo.svg.png'),
(3, 'Seiko', 'Đồng hồ cơ Nhật Bản', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Seiko_logo.svg/200px-Seiko_logo.svg.png'),
(4, 'Citizen', 'Đồng hồ năng lượng ánh sáng', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Citizen_Watch_Logo.svg/200px-Citizen_Watch_Logo.svg.png'),
(5, 'Orient', 'Đồng hồ cơ tự động Nhật Bản', 'https://orientwatch.com/cdn/shop/files/orient-logo.png'),
(6, 'Tissot', 'Đồng hồ Thụy Sĩ giá tốt', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Tissot_Logo.svg/200px-Tissot_Logo.svg.png'),
(7, 'Omega', 'Đồng hồ xa xỉ Thụy Sĩ', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Omega_Logo.svg/200px-Omega_Logo.svg.png'),
(8, 'TAG Heuer', 'Đồng hồ thể thao cao cấp', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/TAG_Heuer_Logo.svg/200px-TAG_Heuer_Logo.svg.png');

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Đồng hồ nam', 'Đồng hồ dành cho nam giới'),
(2, 'Đồng hồ nữ', 'Đồng hồ dành cho nữ giới'),
(3, 'Đồng hồ thể thao', 'Đồng hồ chống nước, chống va đập'),
(4, 'Đồng hồ thời trang', 'Đồng hồ phong cách hiện đại'),
(5, 'Đồng hồ cơ', 'Đồng hồ cơ tự động cao cấp'),
(6, 'Đồng hồ thông minh', 'Smartwatch đa năng'),
(7, 'Đồng hồ lặn', 'Đồng hồ chuyên dụng lặn biển'),
(8, 'Đồng hồ chronograph', 'Đồng hồ có chức năng bấm giờ');

-- ============================================
-- 3. SUPPLIERS TABLE
-- ============================================
INSERT INTO `suppliers` (`id`, `name`, `contact`) VALUES
(1, 'Swiss Watch Import', 'contact@swisswatch.com | 0901234567'),
(2, 'Japan Watch Distribution', 'info@japanwatch.com | 0907654321'),
(3, 'Luxury Timepiece Co.', 'sales@luxurytime.com | 0909876543'),
(4, 'Global Watch Trading', 'trade@globalwatch.com | 0905555555'),
(5, 'Asia Watch Supplies', 'asia@watchsupply.com | 0908888888');

-- ============================================
-- 4. USERS TABLE (Password: password123)
-- ============================================
INSERT INTO `users` (`id`, `username`, `password`, `email`, `full_name`, `role`, `is_active`, `created_at`) VALUES
(1, 'admin', '$2a$10$JdHQh9FfYD.V5y6FS1KdCe7F5XTW9HZqN9c8xhTqKSKxJxjpRxUWm', 'admin@watchstore.com', 'Administrator', 'ADMIN', 1, NOW()),
(2, 'customer1', '$2a$10$JdHQh9FfYD.V5y6FS1KdCe7F5XTW9HZqN9c8xhTqKSKxJxjpRxUWm', 'nguyenvana@gmail.com', 'Nguyễn Văn An', 'USER', 1, NOW()),
(3, 'customer2', '$2a$10$JdHQh9FfYD.V5y6FS1KdCe7F5XTW9HZqN9c8xhTqKSKxJxjpRxUWm', 'tranthib@gmail.com', 'Trần Thị Bình', 'USER', 1, NOW()),
(4, 'customer3', '$2a$10$JdHQh9FfYD.V5y6FS1KdCe7F5XTW9HZqN9c8xhTqKSKxJxjpRxUWm', 'leminhhchau@gmail.com', 'Lê Minh Châu', 'USER', 1, NOW()),
(5, 'customer4', '$2a$10$JdHQh9FfYD.V5y6FS1KdCe7F5XTW9HZqN9c8xhTqKSKxJxjpRxUWm', 'phamthidung@gmail.com', 'Phạm Thị Dung', 'USER', 1, NOW());

-- ============================================
-- 5. PRODUCTS TABLE (ĐÃ SỬA - không có cột 'brand')
-- ============================================
INSERT INTO `products` (`id`, `name`, `brand_id`, `category_id`, `supplier_id`, `description`, `status`, `created_at`) VALUES
(1, 'Rolex Submariner Date', 1, 7, 1, 'Đồng hồ lặn cao cấp, chống nước 300m, kính Sapphire chống xước. Vỏ thép Oystersteel 904L không gỉ. Máy cơ tự động Caliber 3235.', 'ACTIVE', NOW()),
(2, 'Casio G-Shock GA-2100', 2, 3, 2, 'Đồng hồ thể thao chống sốc Carbon Core Guard, chống nước 200m. Thiết kế mỏng gọn, pin 3 năm. Đèn LED tự động.', 'ACTIVE', NOW()),
(3, 'Seiko 5 Sports SRPD', 3, 5, 2, 'Đồng hồ cơ tự động 4R36, trữ cót 41 giờ. Chống nước 100m. Lịch ngày tự động. Thiết kế thể thao năng động.', 'ACTIVE', NOW()),
(4, 'Citizen Eco-Drive BM7251', 4, 4, 2, 'Đồng hồ năng lượng ánh sáng, không cần thay pin. Trữ năng lượng 6 tháng. Chống nước 100m. Thiết kế thanh lịch.', 'ACTIVE', NOW()),
(5, 'Orient Bambino Gen 2', 5, 5, 2, 'Đồng hồ cơ tự động dress watch. Mặt số dome cao cổ điển. Kính khoáng chống xước. Dây da cao cấp.', 'ACTIVE', NOW()),
(6, 'Casio Edifice EFR-556', 2, 8, 2, 'Chronograph thể thao, chống nước 100m. Vỏ thép không gỉ. Thiết kế phong cách đua xe. Dây kim loại.', 'ACTIVE', NOW()),
(7, 'Seiko Presage Cocktail', 3, 5, 2, 'Đồng hồ cơ cao cấp, mặt số đặc biệt lấy cảm hứng từ cocktail. Máy 4R35. Trữ cót 41 giờ.', 'ACTIVE', NOW()),
(8, 'Casio MTP-1370L', 2, 4, 2, 'Đồng hồ thời trang giá rẻ, pin quartz chính xác. Chống nước 50m. Thiết kế đơn giản, thanh lịch.', 'ACTIVE', NOW()),
(9, 'Tissot PRX Powermatic 80', 6, 5, 1, 'Đồng hồ cơ Thụy Sĩ, trữ cót 80 giờ. Thiết kế retro 70s. Chống nước 100m. Vỏ thép nguyên khối.', 'ACTIVE', NOW()),
(10, 'Rolex Datejust 36', 1, 1, 1, 'Đồng hồ dress watch biểu tượng. Vỏ Oystersteel và vàng trắng 18k. Máy Perpetual 3235. Chống nước 100m.', 'ACTIVE', NOW()),
(11, 'Omega Seamaster Diver', 7, 7, 3, 'Đồng hồ lặn chuyên nghiệp, chống nước 300m. Máy cơ Co-Axial 8800. Kính Sapphire chống phản chiếu.', 'ACTIVE', NOW()),
(12, 'TAG Heuer Carrera', 8, 8, 3, 'Chronograph thể thao cao cấp. Máy Calibre 16. Thiết kế lấy cảm hứng từ đua xe Formula 1.', 'ACTIVE', NOW());

-- ============================================
-- 6. PRODUCT_IMAGES TABLE
-- ============================================
INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`) VALUES
-- Rolex Submariner
(1, 1, 'https://content.rolex.com/dam/new-watches-2024/family-pages/professional-watches/submariner/cover/m126610lv-0002.jpg', 1),
(2, 1, 'https://content.rolex.com/dam/new-watches-2024/family-pages/professional-watches/submariner/gallery/m126610lv-0002_2401jva_001.jpg', 0),

-- Casio G-Shock
(3, 2, 'https://images.unsplash.com/photo-1617625802912-cde586faf331?w=500', 1),
(4, 2, 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500', 0),

-- Seiko 5 Sports
(5, 3, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500', 1),
(6, 3, 'https://images.unsplash.com/photo-1606390927628-1e6c37b1ee7e?w=500', 0),

-- Citizen Eco-Drive
(7, 4, 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500', 1),

-- Orient Bambino
(8, 5, 'https://images.unsplash.com/photo-1611850753623-9bbebb92f554?w=500', 1),

-- Casio Edifice
(9, 6, 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500', 1),

-- Seiko Presage
(10, 7, 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=500', 1),
(11, 7, 'https://images.unsplash.com/photo-1601513445506-2ab0d4fb4229?w=500', 0),

-- Casio MTP
(12, 8, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500', 1),

-- Tissot PRX
(13, 9, 'https://images.unsplash.com/photo-1639006570490-79c0c53f1080?w=500', 1),

-- Rolex Datejust
(14, 10, 'https://content.rolex.com/dam/2024/upright-bba-with-shadow/m126234-0051.png', 1),

-- Omega Seamaster
(15, 11, 'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=500', 1),

-- TAG Heuer
(16, 12, 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=500', 1);

-- ============================================
-- 7. PRODUCT_PRICES TABLE
-- ============================================
INSERT INTO `product_prices` (`id`, `product_id`, `price`, `price_type`, `is_current`, `start_date`, `end_date`) VALUES
(1, 1, 280000000.00, 'REGULAR', 1, NOW(), NULL),
(2, 2, 3500000.00, 'REGULAR', 1, NOW(), NULL),
(3, 3, 8500000.00, 'REGULAR', 1, NOW(), NULL),
(4, 4, 6200000.00, 'REGULAR', 1, NOW(), NULL),
(5, 5, 4800000.00, 'REGULAR', 1, NOW(), NULL),
(6, 6, 4200000.00, 'REGULAR', 1, NOW(), NULL),
(7, 7, 15000000.00, 'REGULAR', 1, NOW(), NULL),
(8, 8, 1200000.00, 'REGULAR', 1, NOW(), NULL),
(9, 9, 24500000.00, 'REGULAR', 1, NOW(), NULL),
(10, 10, 320000000.00, 'REGULAR', 1, NOW(), NULL),
(11, 11, 185000000.00, 'REGULAR', 1, NOW(), NULL),
(12, 12, 95000000.00, 'REGULAR', 1, NOW(), NULL),

-- Sale prices
(13, 2, 2800000.00, 'SALE', 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
(14, 4, 5270000.00, 'SALE', 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
(15, 8, 960000.00, 'SALE', 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- ============================================
-- 8. PRODUCT_SPECS TABLE
-- ============================================
INSERT INTO `product_specs` (`id`, `product_id`, `key_name`, `value`) VALUES
-- Rolex Submariner
(1, 1, 'Loại máy', 'Cơ tự động Caliber 3235'),
(2, 1, 'Đường kính', '41mm'),
(3, 1, 'Chất liệu vỏ', 'Thép Oystersteel 904L'),
(4, 1, 'Chống nước', '300m (30 ATM)'),
(5, 1, 'Kính', 'Sapphire chống xước'),
(6, 1, 'Trữ cót', '70 giờ'),

-- Casio G-Shock
(7, 2, 'Loại máy', 'Quartz'),
(8, 2, 'Đường kính', '45.4mm'),
(9, 2, 'Chống nước', '200m (20 ATM)'),
(10, 2, 'Pin', '3 năm'),
(11, 2, 'Đèn', 'LED tự động'),

-- Seiko 5 Sports
(12, 3, 'Loại máy', 'Cơ tự động 4R36'),
(13, 3, 'Đường kính', '42.5mm'),
(14, 3, 'Trữ cót', '41 giờ'),
(15, 3, 'Chống nước', '100m'),

-- Citizen Eco-Drive
(16, 4, 'Loại máy', 'Eco-Drive'),
(17, 4, 'Đường kính', '40mm'),
(18, 4, 'Trữ năng lượng', '6 tháng'),
(19, 4, 'Chống nước', '100m'),

-- Orient Bambino
(20, 5, 'Loại máy', 'Cơ tự động F6724'),
(21, 5, 'Đường kính', '40.5mm'),
(22, 5, 'Kính', 'Khoáng dome'),
(23, 5, 'Chống nước', '30m'),

-- Casio Edifice
(24, 6, 'Loại máy', 'Quartz Chronograph'),
(25, 6, 'Đường kính', '49mm'),
(26, 6, 'Chống nước', '100m'),

-- Seiko Presage
(27, 7, 'Loại máy', 'Cơ tự động 4R35'),
(28, 7, 'Đường kính', '40.5mm'),
(29, 7, 'Kính', 'Sapphire'),
(30, 7, 'Trữ cót', '41 giờ'),

-- Casio MTP
(31, 8, 'Loại máy', 'Quartz'),
(32, 8, 'Đường kính', '43mm'),
(33, 8, 'Chống nước', '50m'),

-- Tissot PRX
(34, 9, 'Loại máy', 'Powermatic 80'),
(35, 9, 'Trữ cót', '80 giờ'),
(36, 9, 'Chống nước', '100m'),

-- Rolex Datejust
(37, 10, 'Loại máy', 'Perpetual 3235'),
(38, 10, 'Đường kính', '36mm'),
(39, 10, 'Trữ cót', '70 giờ'),

-- Omega Seamaster
(40, 11, 'Loại máy', 'Co-Axial 8800'),
(41, 11, 'Đường kính', '42mm'),
(42, 11, 'Chống nước', '300m'),
(43, 11, 'Kính', 'Sapphire chống phản chiếu'),

-- TAG Heuer Carrera
(44, 12, 'Loại máy', 'Calibre 16'),
(45, 12, 'Đường kính', '43mm'),
(46, 12, 'Chống nước', '100m');

-- ============================================
-- 9. INVENTORIES TABLE
-- ============================================
INSERT INTO `inventories` (`id`, `product_id`, `stock`, `updated_at`) VALUES
(1, 1, 5, NOW()),
(2, 2, 50, NOW()),
(3, 3, 30, NOW()),
(4, 4, 25, NOW()),
(5, 5, 20, NOW()),
(6, 6, 35, NOW()),
(7, 7, 15, NOW()),
(8, 8, 100, NOW()),
(9, 9, 12, NOW()),
(10, 10, 3, NOW()),
(11, 11, 8, NOW()),
(12, 12, 10, NOW());

-- ============================================
-- 10. REVIEWS TABLE
-- ============================================
INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 5, 'Đồng hồ G-Shock rất bền, chống nước tốt. Giao hàng nhanh!', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 2, 3, 4, 'Chất lượng tốt, giá hợp lý. Recommend!', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(3, 3, 4, 5, 'Đồng hồ cơ rất đẹp, chạy chuẩn xác. Mình rất hài lòng!', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(4, 4, 2, 5, 'Không cần thay pin rất tiện. Đồng hồ đẹp, sang!', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 5, 5, 5, 'Orient Bambino đẹp xuất sắc! Mặt số dome rất độc đáo.', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 7, 3, 5, 'Seiko Presage mặt số cocktail tuyệt vời!', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 8, 4, 4, 'Giá rẻ mà chất lượng ok. Đáng mua!', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 3, 5, 5, 'Seiko 5 rất tốt, chạy ổn định!', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 10b. NOTIFICATIONS TABLE
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 2, 'Chào mừng đến Watch Store', 'Chúc bạn có trải nghiệm mua sắm tuyệt vời cùng Watch Store!', 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 3, 'Ưu đãi tháng này', 'Giảm giá 20% cho các mẫu Casio trong tuần này.', 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 4, 'Cập nhật đơn hàng', 'Đơn hàng #3 của bạn đã được giao thành công.', 1, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- ============================================
-- 11. PROMOTIONS TABLE
-- ============================================
INSERT INTO `promotions` (`id`, `name`, `discount`, `start_date`, `end_date`, `created_at`) VALUES
(1, 'Black Friday 2025', 20.00, '2025-11-20 00:00:00', '2025-11-30 23:59:59', NOW()),
(2, 'Khuyến mãi Tết 2026', 15.00, '2026-01-15 00:00:00', '2026-02-10 23:59:59', NOW()),
(3, 'Sale Cuối Năm', 10.00, '2025-12-15 00:00:00', '2025-12-31 23:59:59', NOW()),
(4, 'Giảm giá mùa hè', 25.00, '2025-06-01 00:00:00', '2025-08-31 23:59:59', NOW());

-- ============================================
-- 12. PROMOTION_PRODUCTS TABLE
-- ============================================
INSERT INTO `promotion_products` (`promotion_id`, `product_id`) VALUES
-- Black Friday - Casio
(1, 2), (1, 6), (1, 8),

-- Tết - Japanese watches
(2, 3), (2, 4), (2, 5), (2, 7),

-- Year-end - Swiss watches
(3, 1), (3, 9), (3, 10),

-- Summer sale
(4, 2), (4, 6), (4, 11), (4, 12);

-- ============================================
-- 13. CARTS TABLE
-- ============================================
INSERT INTO `carts` (`id`, `user_id`) VALUES
(1, 2),
(2, 3),
(3, 4),
(4, 5);

-- ============================================
-- 14. CART_ITEMS TABLE
-- ============================================
INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`) VALUES
(1, 1, 2, 1),
(2, 1, 4, 1),
(3, 2, 3, 1),
(4, 2, 8, 2),
(5, 3, 5, 1),
(6, 4, 6, 1),
(7, 4, 7, 1);

-- ============================================
-- 15. ORDERS TABLE
-- ============================================
INSERT INTO `orders` (`id`, `user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 3, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(3, 4, 'SHIPPED', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 5, 'PAID', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 2, 'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================
-- 16. ORDER_ITEMS TABLE
-- ============================================
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 7, 1, 15000000.00),
(2, 2, 3, 1, 8500000.00),
(3, 3, 4, 1, 6200000.00),
(4, 4, 5, 1, 4800000.00),
(5, 5, 2, 1, 3500000.00),
(6, 5, 8, 1, 1200000.00);

-- ============================================
-- 17. PAYMENTS TABLE
-- ============================================
INSERT INTO `payments` (`id`, `order_id`, `amount`, `method`, `created_at`) VALUES
(1, 1, 15000000.00, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(2, 2, 8500000.00, 'VNPAY', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(3, 3, 6200000.00, 'CASH', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 4, 4800000.00, 'MOMO', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- 18. SHIPMENTS TABLE
-- ============================================
INSERT INTO `shipments` (`id`, `order_id`, `address`, `status`, `created_at`) VALUES
(1, 1, '123 Nguyễn Trãi, Q.1, TP.HCM', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 2, '456 Lê Lợi, Q.5, TP.HCM', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(3, 3, '789 Trần Hưng Đạo, Hà Nội', 'SHIPPED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 4, '321 Hai Bà Trưng, Đà Nẵng', 'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- RESET AUTO INCREMENT
-- ============================================
ALTER TABLE `brands` AUTO_INCREMENT = 9;
ALTER TABLE `categories` AUTO_INCREMENT = 9;
ALTER TABLE `suppliers` AUTO_INCREMENT = 6;
ALTER TABLE `users` AUTO_INCREMENT = 6;
ALTER TABLE `products` AUTO_INCREMENT = 13;
ALTER TABLE `product_images` AUTO_INCREMENT = 17;
ALTER TABLE `product_prices` AUTO_INCREMENT = 16;
ALTER TABLE `product_specs` AUTO_INCREMENT = 47;
ALTER TABLE `inventories` AUTO_INCREMENT = 13;
ALTER TABLE `reviews` AUTO_INCREMENT = 9;
ALTER TABLE `notifications` AUTO_INCREMENT = 4;
ALTER TABLE `promotions` AUTO_INCREMENT = 5;
ALTER TABLE `carts` AUTO_INCREMENT = 5;
ALTER TABLE `cart_items` AUTO_INCREMENT = 8;
ALTER TABLE `orders` AUTO_INCREMENT = 6;
ALTER TABLE `order_items` AUTO_INCREMENT = 7;
ALTER TABLE `payments` AUTO_INCREMENT = 5;
ALTER TABLE `shipments` AUTO_INCREMENT = 5;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;