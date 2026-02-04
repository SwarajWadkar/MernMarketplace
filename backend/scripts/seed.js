const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@marketplace.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890'
    });

    // Create sellers
    const seller1 = await User.create({
      name: 'John Seller',
      email: 'seller1@marketplace.com',
      password: 'seller123',
      role: 'seller',
      phone: '1111111111',
      businessName: 'John Electronics',
      businessDescription: 'Quality electronics at great prices',
      averageRating: 4.5
    });

    const seller2 = await User.create({
      name: 'Jane Seller',
      email: 'seller2@marketplace.com',
      password: 'seller123',
      role: 'seller',
      phone: '2222222222',
      businessName: 'Jane Fashion & More',
      businessDescription: 'Trendy clothing, toys, and home products',
      averageRating: 4.8
    });

    // Create sample products with local images
    const products = [
      {
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality',
        price: 199.99,
        category: 'Electronics',
        seller: seller1._id,
        stock: 50,
        rating: 4.5,
        reviewCount: 120,
        images: [
          {
            url: '/images/products/headphones-001.jpg',
            publicId: 'headphones-001'
          }
        ]
      },
      {
        name: 'Mechanical Keyboard',
        description: 'High-performance mechanical keyboard with RGB lighting, customizable keys, and ergonomic design',
        price: 129.99,
        category: 'Electronics',
        seller: seller1._id,
        stock: 200,
        rating: 4.2,
        reviewCount: 85,
        images: [
          {
            url: '/images/products/cable-001.jpg',
            publicId: 'keyboard-001'
          }
        ]
      },
      {
        name: 'Smartphone Case',
        description: 'Protective smartphone case with shock absorption and slim design, available for all models',
        price: 29.99,
        category: 'Electronics',
        seller: seller1._id,
        stock: 150,
        rating: 4.6,
        reviewCount: 200,
        images: [
          {
            url: '/images/products/phone-case-001.jpg',
            publicId: 'phone-case-001'
          }
        ]
      },
      {
        name: 'Designer Handbag',
        description: 'Elegant designer handbag made with premium leather, perfect for any occasion with stylish design',
        price: 149.99,
        category: 'Fashion',
        seller: seller2._id,
        stock: 30,
        rating: 4.8,
        reviewCount: 95,
        images: [
          {
            url: '/images/products/handbag-001.jpg',
            publicId: 'handbag-001'
          }
        ]
      },
      {
        name: 'Running Shoes',
        description: 'Professional running shoes with advanced cushioning technology and breathable mesh for comfort',
        price: 119.99,
        category: 'Sports',
        seller: seller2._id,
        stock: 60,
        rating: 4.6,
        reviewCount: 180,
        images: [
          {
            url: '/images/products/shoes-001.jpg',
            publicId: 'shoes-001'
          }
        ]
      },
      {
        name: 'LEGO Creative Set',
        description: 'Creative LEGO building set with 1000+ pieces, perfect for children and adults, endless possibilities',
        price: 79.99,
        category: 'Toys',
        seller: seller1._id,
        stock: 45,
        rating: 4.7,
        reviewCount: 320,
        images: [
          {
            url: '/images/products/lego-set-001.jpg',
            publicId: 'lego-set-001'
          }
        ]
      },
      {
        name: 'Interactive Robot Toy',
        description: 'Interactive robot toy with AI features, voice control capabilities, and programming options for fun',
        price: 89.99,
        category: 'Toys',
        seller: seller2._id,
        stock: 25,
        rating: 4.5,
        reviewCount: 156,
        images: [
          {
            url: '/images/products/toy-robot-001.jpg',
            publicId: 'toy-robot-001'
          }
        ]
      },
      {
        name: 'Modern Desk Lamp',
        description: 'Modern LED desk lamp with adjustable brightness and color temperature control for productivity',
        price: 45.99,
        category: 'Home',
        seller: seller1._id,
        stock: 75,
        rating: 4.4,
        reviewCount: 210,
        images: [
          {
            url: '/images/products/desk-lamp-001.jpg',
            publicId: 'desk-lamp-001'
          }
        ]
      },
      {
        name: 'Comfort Memory Foam Pillow',
        description: 'Premium memory foam pillow with ergonomic design for better sleep quality and neck support',
        price: 59.99,
        category: 'Home',
        seller: seller2._id,
        stock: 100,
        rating: 4.3,
        reviewCount: 445,
        images: [
          {
            url: '/images/products/pillow-001.jpg',
            publicId: 'pillow-001'
          }
        ]
      },
      {
        name: 'Bestselling Fiction Novel',
        description: 'Bestselling fiction novel - a must-read thriller that keeps you on the edge throughout the story',
        price: 24.99,
        category: 'Books',
        seller: seller1._id,
        stock: 200,
        rating: 4.8,
        reviewCount: 523,
        images: [
          {
            url: '/images/products/book-001.jpg',
            publicId: 'book-001'
          }
        ]
      },
      {
        name: 'Smart Watch Pro',
        description: 'Feature-rich smartwatch with fitness tracking, heart rate monitor, GPS, and smart notifications',
        price: 299.99,
        category: 'Other',
        seller: seller1._id,
        stock: 35,
        rating: 4.6,
        reviewCount: 412,
        images: [
          {
            url: '/images/products/watch-001.jpg',
            publicId: 'watch-001'
          }
        ]
      }
    ];

    await Product.insertMany(products);

    console.log('✅ Database seeded successfully!');
    console.log('Admin:', admin.email, '/ admin123');
    console.log('Seller1:', seller1.email, '/ seller123');
    console.log('Seller2:', seller2.email, '/ seller123');
    console.log('Products created: 11 (Electronics: 3, Fashion: 1, Sports: 1, Toys: 2, Home: 2, Books: 1, Other: 1)');

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

module.exports = seedDatabase;
