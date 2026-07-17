package com.easeshop.config;

import com.easeshop.entity.*;
import com.easeshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Initializes the database with seed data on application startup.
 * Only runs if the database is empty (no users exist).
 * Properly hashes passwords with BCrypt.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        // Safe migration: set version to 0 for any existing products with null version
        try {
            jdbcTemplate.execute("UPDATE products SET version = 0 WHERE version IS NULL");
        } catch (Exception e) {
            log.warn("⚠️ Failed to execute version migration: {}", e.getMessage());
        }

        // Idempotent category image updates (using high-quality Unsplash images)
        try {
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80", "Women's Wear");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=600&auto=format&fit=crop&q=80", "Men's Wear");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80", "Ethnic Wear");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80", "Footwear");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80", "Bags & Handbags");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80", "Jewellery");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80", "Watches");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80", "Beauty & Makeup");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80", "Sunglasses");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80", "Winter Wear");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80", "Activewear");
            jdbcTemplate.update("UPDATE categories SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", 
                "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80", "Kids Fashion");
            log.info("✅ Checked and updated category images in the database");
        } catch (Exception e) {
            log.warn("⚠️ Failed to execute category image update migration: {}", e.getMessage());
        }

        // Idempotent admin account creation
        User admin = userRepository.findByEmail("admin@shopease.com").orElse(null);
        if (admin == null) {
            admin = userRepository.save(User.builder()
                    .name("Admin User")
                    .email("admin@shopease.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .phone("9876543210")
                    .build());
            log.info("✅ Created admin user");
        }

        // If the database has already been seeded with other data, skip generating duplicate categories/products
        if (userRepository.count() > 1 && categoryRepository.count() > 0) {
            log.info("📦 Database already seeded with users and categories. Skipping full seeding.");
            return;
        }

        log.info("🌱 Seeding database with initial data...");

        User john = userRepository.save(User.builder()
                .name("John Doe")
                .email("john@example.com")
                .password(passwordEncoder.encode("user123"))
                .role(Role.ROLE_USER)
                .phone("9876543211")
                .build());

        User jane = userRepository.save(User.builder()
                .name("Jane Smith")
                .email("jane@example.com")
                .password(passwordEncoder.encode("user123"))
                .role(Role.ROLE_USER)
                .phone("9876543212")
                .build());

        log.info("✅ Created John and Jane user accounts");

        // Create Carts for users
        cartRepository.save(Cart.builder().user(john).build());
        cartRepository.save(Cart.builder().user(jane).build());
        log.info("✅ Created carts for users");

        // Create Addresses
        john.getAddresses().add(Address.builder()
                .user(john).fullName("John Doe").phoneNumber("9876543211")
                .addressLine1("123 MG Road").addressLine2("Near Central Mall")
                .city("Bangalore").state("Karnataka").postalCode("560001")
                .country("India").isDefault(true).build());
        userRepository.save(john);

        jane.getAddresses().add(Address.builder()
                .user(jane).fullName("Jane Smith").phoneNumber("9876543212")
                .addressLine1("456 Park Avenue").addressLine2("Apt 7B")
                .city("Mumbai").state("Maharashtra").postalCode("400001")
                .country("India").isDefault(true).build());
        userRepository.save(jane);
        log.info("✅ Created sample addresses");

        // Create Categories — Fashion Focused
        Category womenWear = categoryRepository.save(Category.builder().name("Women's Wear").description("Trendy dresses, tops, and ethnic wear for women").imageUrl("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category menWear = categoryRepository.save(Category.builder().name("Men's Wear").description("Shirts, t-shirts, jeans and formal wear for men").imageUrl("https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category ethnicWear = categoryRepository.save(Category.builder().name("Ethnic Wear").description("Traditional Indian kurtas, sarees, and lehengas").imageUrl("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category footwear = categoryRepository.save(Category.builder().name("Footwear").description("Sneakers, heels, boots and sandals").imageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category bagsCategory = categoryRepository.save(Category.builder().name("Bags & Handbags").description("Totes, clutches, backpacks and sling bags").imageUrl("https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category jewelleryCategory = categoryRepository.save(Category.builder().name("Jewellery").description("Necklaces, earrings, bracelets and rings").imageUrl("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category watchesCategory = categoryRepository.save(Category.builder().name("Watches").description("Analog, digital and smartwatches").imageUrl("https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category beautyCategory = categoryRepository.save(Category.builder().name("Beauty & Makeup").description("Cosmetics, skincare and fragrances").imageUrl("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category sunglassesCategory = categoryRepository.save(Category.builder().name("Sunglasses").description("Aviators, wayfarers and designer frames").imageUrl("https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category winterWear = categoryRepository.save(Category.builder().name("Winter Wear").description("Jackets, sweaters, hoodies and thermals").imageUrl("https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category activewear = categoryRepository.save(Category.builder().name("Activewear").description("Gym wear, yoga pants, sports bras and track suits").imageUrl("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80").active(true).build());
        Category kidsFashion = categoryRepository.save(Category.builder().name("Kids Fashion").description("Clothing and accessories for kids").imageUrl("https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80").active(true).build());

        log.info("✅ Created 12 fashion categories");

        List<Product> products = List.of(
                // Women's Wear
                Product.builder().name("Floral Maxi Dress").description("Elegant floral print maxi dress, perfect for summer outings").price(new BigDecimal("1999")).stock(50).brand("Zara").category(womenWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600").build(),
                Product.builder().name("Silk Blouse - Ivory").description("Premium silk blouse with button-down front").price(new BigDecimal("2499")).stock(35).brand("H&M").category(womenWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=600").build(),
                Product.builder().name("High-Waist Palazzo Pants").description("Comfortable wide-leg palazzo pants in breathable fabric").price(new BigDecimal("1299")).stock(60).brand("Forever 21").category(womenWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600").build(),
                Product.builder().name("Crop Top - Black").description("Trendy solid black crop top with ribbed texture").price(new BigDecimal("799")).stock(80).brand("H&M").category(womenWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1503342217505-b0a15ec515c7?w=600").build(),
                Product.builder().name("A-Line Midi Skirt").description("Classic A-line skirt in pastel blue with side zip").price(new BigDecimal("1499")).stock(40).brand("Mango").category(womenWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600").build(),

                // Men's Wear
                Product.builder().name("Slim Fit Oxford Shirt").description("Classic cotton Oxford shirt in navy blue for office and casual wear").price(new BigDecimal("1499")).stock(65).brand("Van Heusen").category(menWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600").build(),
                Product.builder().name("Premium Denim Jeans").description("Dark wash slim-fit jeans with stretch comfort").price(new BigDecimal("2499")).stock(50).brand("Levi's").category(menWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1542272604-787c3835535d?w=600").build(),
                Product.builder().name("Graphic Printed T-Shirt").description("100% cotton oversized tee with urban graphic print").price(new BigDecimal("699")).stock(100).brand("Puma").category(menWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600").build(),
                Product.builder().name("Chino Trousers - Khaki").description("Tailored fit chinos in classic khaki").price(new BigDecimal("1799")).stock(45).brand("Allen Solly").category(menWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600").build(),
                Product.builder().name("Polo T-Shirt - Red").description("Cotton pique polo with embroidered logo").price(new BigDecimal("999")).stock(70).brand("U.S. Polo").category(menWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600").build(),

                // Ethnic Wear
                Product.builder().name("Embroidered Anarkali Kurta").description("Stunning floral embroidered Anarkali kurta in royal blue").price(new BigDecimal("3999")).stock(25).brand("Biba").category(ethnicWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600").build(),
                Product.builder().name("Cotton Kurta Pajama Set").description("Pure cotton kurta pajama set in off-white for festivals").price(new BigDecimal("1999")).stock(40).brand("Fabindia").category(ethnicWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600").build(),
                Product.builder().name("Banarasi Silk Saree").description("Handwoven Banarasi silk saree in maroon with gold zari work").price(new BigDecimal("8999")).stock(15).brand("Sabyasachi").category(ethnicWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600").build(),

                // Footwear
                Product.builder().name("White Sneakers - Classic").description("Minimalist white sneakers with cushioned sole").price(new BigDecimal("3499")).stock(55).brand("Nike").category(footwear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600").build(),
                Product.builder().name("Block Heel Sandals").description("Elegant block heel sandals in nude for parties").price(new BigDecimal("2299")).stock(35).brand("Aldo").category(footwear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600").build(),
                Product.builder().name("Chelsea Boots - Brown").description("Premium leather Chelsea boots with elastic panels").price(new BigDecimal("4999")).stock(20).brand("Clarks").category(footwear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600").build(),
                Product.builder().name("Sports Running Shoes").description("Lightweight mesh running shoes with responsive cushioning").price(new BigDecimal("3999")).stock(45).brand("Adidas").category(footwear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600").build(),

                // Bags & Handbags
                Product.builder().name("Leather Tote Bag").description("Spacious genuine leather tote in tan with zip closure").price(new BigDecimal("4499")).stock(25).brand("Hidesign").category(bagsCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600").build(),
                Product.builder().name("Canvas Backpack").description("Durable canvas backpack with laptop compartment").price(new BigDecimal("1599")).stock(60).brand("Wildcraft").category(bagsCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600").build(),
                Product.builder().name("Embellished Clutch").description("Evening clutch with crystal embellishment and chain strap").price(new BigDecimal("1999")).stock(30).brand("Aldo").category(bagsCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600").build(),

                // Jewellery
                Product.builder().name("Gold Plated Layered Necklace").description("Delicate multi-layer gold plated necklace").price(new BigDecimal("1499")).stock(40).brand("Giva").category(jewelleryCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600").build(),
                Product.builder().name("Pearl Drop Earrings").description("Freshwater pearl drop earrings with sterling silver hooks").price(new BigDecimal("999")).stock(50).brand("Tanishq").category(jewelleryCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600").build(),
                Product.builder().name("Statement Cuff Bracelet").description("Bold geometric cuff bracelet in rose gold finish").price(new BigDecimal("1799")).stock(25).brand("Swarovski").category(jewelleryCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600").build(),

                // Watches
                Product.builder().name("Classic Analog Watch").description("Stainless steel analog watch with leather strap").price(new BigDecimal("3999")).stock(30).brand("Titan").category(watchesCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600").build(),
                Product.builder().name("Smart Fitness Watch").description("Fitness tracker with heart rate and SpO2 monitoring").price(new BigDecimal("4999")).stock(40).brand("Noise").category(watchesCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600").build(),
                Product.builder().name("Rose Gold Ladies Watch").description("Elegant rose gold watch with mesh strap").price(new BigDecimal("2999")).stock(25).brand("Fossil").category(watchesCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600").build(),

                // Beauty & Makeup
                Product.builder().name("Matte Lipstick Set").description("Set of 4 long-lasting matte lipsticks in trending shades").price(new BigDecimal("1299")).stock(70).brand("MAC").category(beautyCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600").build(),
                Product.builder().name("Luxury Perfume - Floral").description("Eau de parfum with notes of jasmine, rose, and sandalwood").price(new BigDecimal("3499")).stock(35).brand("Gucci").category(beautyCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1541643600914-78b084683601?w=600").build(),
                Product.builder().name("Skincare Hydrating Serum").description("Hyaluronic acid serum for deep hydration and glow").price(new BigDecimal("899")).stock(80).brand("The Ordinary").category(beautyCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600").build(),

                // Sunglasses
                Product.builder().name("Aviator Sunglasses").description("Classic aviator with UV400 polarized lenses").price(new BigDecimal("2999")).stock(40).brand("Ray-Ban").category(sunglassesCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600").build(),
                Product.builder().name("Wayfarer Sunglasses").description("Retro wayfarer style with gradient lenses").price(new BigDecimal("1999")).stock(50).brand("Fastrack").category(sunglassesCategory).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600").build(),

                // Winter Wear
                Product.builder().name("Puffer Jacket - Black").description("Warm quilted puffer jacket with hood, water-resistant").price(new BigDecimal("4999")).stock(25).brand("Zara").category(winterWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1544923246-77307dd270b5?w=600").build(),
                Product.builder().name("Cashmere Sweater").description("Soft cashmere crew neck sweater in heather grey").price(new BigDecimal("3499")).stock(20).brand("Uniqlo").category(winterWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600").build(),
                Product.builder().name("Denim Jacket - Classic").description("Timeless blue denim jacket with chest pockets").price(new BigDecimal("2999")).stock(35).brand("Levi's").category(winterWear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600").build(),

                // Activewear
                Product.builder().name("Yoga Leggings - Seamless").description("High-waist seamless leggings with moisture-wicking fabric").price(new BigDecimal("1799")).stock(50).brand("Nike").category(activewear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600").build(),
                Product.builder().name("Dry-Fit Sports T-Shirt").description("Breathable dry-fit t-shirt for intense workouts").price(new BigDecimal("999")).stock(70).brand("Adidas").category(activewear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600").build(),
                Product.builder().name("Track Suit Set").description("Full zip jacket and jogger pants set in navy").price(new BigDecimal("2999")).stock(30).brand("Puma").category(activewear).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600").build(),

                // Kids Fashion
                Product.builder().name("Kids Printed T-Shirt Pack").description("Pack of 3 colorful printed cotton t-shirts for kids").price(new BigDecimal("899")).stock(80).brand("Max").category(kidsFashion).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600").build(),
                Product.builder().name("Girls Party Dress").description("Sparkly tulle party dress with bow detail").price(new BigDecimal("1999")).stock(30).brand("Marks & Spencer").category(kidsFashion).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600").build(),
                Product.builder().name("Boys Denim Shorts").description("Comfortable denim shorts with elastic waist").price(new BigDecimal("699")).stock(60).brand("H&M").category(kidsFashion).createdBy(admin).imageUrl("https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600").build()
        );

        productRepository.saveAll(products);
        log.info("✅ Created {} fashion products across 12 categories", products.size());


        log.info("🎉 Database seeding complete!");
        log.info("📧 Admin: admin@shopease.com / admin123");
        log.info("📧 User1: john@example.com / user123");
        log.info("📧 User2: jane@example.com / user123");
    }
}
