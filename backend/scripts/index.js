// This script seeds the database with sample data
// Run with: npm run seed

require('dotenv').config();
const connectDB = require('../config/database');
const seedDatabase = require('./seed');

const runSeed = async () => {
  await connectDB();
  await seedDatabase();
  process.exit(0);
};

runSeed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
