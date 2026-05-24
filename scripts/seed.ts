import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const {
  MONGODB_URI,
  DEFAULT_ADMIN_EMAIL = 'admin@stockpilot.com',
  DEFAULT_ADMIN_PASSWORD = 'AdminPassword123!',
  DEFAULT_ADMIN_BUSINESS = 'PilotRetail',
} = process.env;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

// Generate SKU helper
function generateSKU(category: string, index: number): string {
  return `${category.slice(0, 3).toUpperCase()}-${1000 + index}`;
}

async function seed() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;

  // 1. Ensure Default Admin User Exists
  const adminQuery = { email: { $regex: new RegExp(`^${DEFAULT_ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } };
  let adminUser = await db.collection('users').findOne(adminQuery);

  if (!adminUser) {
    console.log('Seeding default admin user...');
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
    const businessId = randomBytes(12).toString('hex');
    const result = await db.collection('users').insertOne({
      name: 'Admin',
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      businessName: DEFAULT_ADMIN_BUSINESS,
      businessId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    adminUser = await db.collection('users').findOne({ _id: result.insertedId });
    console.log(`Seeded admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Find all unique users/businesses to seed dummy data for
  const allUsers = await db.collection('users').find({}).toArray();
  console.log(`Found ${allUsers.length} user account(s) to evaluate.`);

  for (const user of allUsers) {
    const businessId = user.businessId;
    const userId = user._id;

    // Check if this business already has products
    const productCount = await db.collection('products').countDocuments({ businessId });
    if (productCount > 0) {
      console.log(`Business "${user.businessName}" (${businessId}) already has products. Skipping dummy data seeding.`);
      continue;
    }

    console.log(`Seeding rich dummy data for Business: "${user.businessName}" (User: ${user.email})...`);

    // A. Seed Suppliers
    const suppliersData = [
      {
        name: 'Alaba Wholesale Ltd',
        contactPerson: 'Chinedu Okeke',
        email: 'chinedu@alaba.example.com',
        phone: '+234 803 123 4567',
        address: 'Alaba International Market, Ojo, Lagos',
        isArchived: false,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Unilever Nigeria Distributors',
        contactPerson: 'Funmi Ademola',
        email: 'funmi@unilever-dist.example.com',
        phone: '+234 812 345 6789',
        address: 'Billings Way, Oregun, Ikeja, Lagos',
        isArchived: false,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Golden Foods & Beverages',
        contactPerson: 'Alhaji Musa',
        email: 'musa@goldenfoods.example.com',
        phone: '+234 905 987 6543',
        address: 'Kano Industrial Area, Kano',
        isArchived: false,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const supplierResult = await db.collection('suppliers').insertMany(suppliersData);
    const supplierIds = Object.values(supplierResult.insertedIds);
    console.log(`- Seeded ${supplierIds.length} suppliers.`);

    // B. Seed Categories
    const categoriesData = [
      {
        name: 'Electronics',
        description: 'Televisions, power banks, chargers, and general gadgets',
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Beverages',
        description: 'Soft drinks, fruit juices, and bottled water',
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Provisions',
        description: 'Breakfast cereals, milk, sugar, and household essentials',
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Toiletries',
        description: 'Soaps, toothpastes, tissue papers, and detergents',
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const categoryResult = await db.collection('categories').insertMany(categoriesData);
    const categoryIds = Object.values(categoryResult.insertedIds);
    console.log(`- Seeded ${categoryIds.length} categories.`);

    // C. Seed Products
    const productsData = [
      // Electronics (Category index 0)
      {
        name: '20000mAh Power Bank',
        sku: generateSKU('Electronics', 1),
        category: categoryIds[0],
        description: 'High capacity fast charging power bank with dual USB ports',
        unit: 'pcs',
        costPrice: 8500,
        sellingPrice: 13500,
        currentStock: 45,
        reorderPoint: 10,
        supplier: supplierIds[0],
        isArchived: false,
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'USB-C Fast Charger Cable',
        sku: generateSKU('Electronics', 2),
        category: categoryIds[0],
        description: 'Durable braided nylon USB-C to USB-C charging cable (2m)',
        unit: 'pcs',
        costPrice: 1200,
        sellingPrice: 2500,
        currentStock: 120,
        reorderPoint: 15,
        supplier: supplierIds[0],
        isArchived: false,
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bluetooth Wireless Speaker',
        sku: generateSKU('Electronics', 3),
        category: categoryIds[0],
        description: 'Waterproof portable stereo speaker with 12hr playtime',
        unit: 'pcs',
        costPrice: 15000,
        sellingPrice: 22000,
        currentStock: 4, // LOW STOCK TRIGGER (reorderPoint is 5)
        reorderPoint: 5,
        supplier: supplierIds[0],
        isArchived: false,
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Beverages (Category index 1)
      {
        name: 'Coca Cola 50cl (Case of 12)',
        sku: generateSKU('Beverages', 1),
        category: categoryIds[1],
        description: 'Standard case of classic Coca-Cola plastic bottles',
        unit: 'cases',
        costPrice: 2800,
        sellingPrice: 3600,
        currentStock: 30,
        reorderPoint: 8,
        supplier: supplierIds[2],
        isArchived: false,
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Premium Orange Juice 1L',
        sku: generateSKU('Beverages', 2),
        category: categoryIds[1],
        description: '100% natural pure squeezed orange juice pack',
        unit: 'cartons',
        costPrice: 950,
        sellingPrice: 1400,
        currentStock: 0, // OUT OF STOCK TRIGGER
        reorderPoint: 10,
        supplier: supplierIds[2],
        isArchived: false,
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Provisions (Category index 2)
      {
        name: 'Peak Milk Powder 400g',
        sku: generateSKU('Provisions', 1),
        category: categoryIds[2],
        description: 'Rich and creamy instant full cream milk powder tin',
        unit: 'tins',
        costPrice: 3400,
        sellingPrice: 4200,
        currentStock: 65,
        reorderPoint: 12,
        supplier: supplierIds[1],
        isArchived: false,
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Golden Morn Cereal 500g',
        sku: generateSKU('Provisions', 2),
        category: categoryIds[2],
        description: 'Nutritious whole maize and soya protein breakfast cereal pack',
        unit: 'packs',
        costPrice: 1800,
        sellingPrice: 2400,
        currentStock: 8, // LOW STOCK TRIGGER (reorderPoint is 10)
        reorderPoint: 10,
        supplier: supplierIds[1],
        isArchived: false,
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Toiletries (Category index 3)
      {
        name: 'Colgate Toothpaste 140g',
        sku: generateSKU('Toiletries', 1),
        category: categoryIds[3],
        description: 'Maximum cavity protection fluoride toothpaste',
        unit: 'packs',
        costPrice: 850,
        sellingPrice: 1200,
        currentStock: 90,
        reorderPoint: 20,
        supplier: supplierIds[1],
        isArchived: false,
        createdBy: userId,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const productResult = await db.collection('products').insertMany(productsData);
    const productIds = Object.values(productResult.insertedIds);
    console.log(`- Seeded ${productIds.length} products.`);

    // D. Seed Stock Transactions (Spread across the last 30 days to build nice-looking charts)
    console.log('- Generating transaction history (30 days)...');
    const transactionsData = [];
    
    // Helper to generate a date N days ago
    const daysAgo = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60)); // Random daylight hours
      return d;
    };

    // 1. Seeding Stock-ins (Supplies received)
    // iPhone Power banks received 25 days ago
    transactionsData.push({
      product: productIds[0],
      type: 'stock_in',
      quantity: 50,
      previousStock: 0,
      newStock: 50,
      unitCost: 8500,
      reason: 'Initial supplier stock procurement',
      supplier: supplierIds[0],
      performedBy: userId,
      businessId,
      notes: 'Received bulk supply from Alaba Inc.',
      createdAt: daysAgo(25),
    });

    // USB Cables received 20 days ago
    transactionsData.push({
      product: productIds[1],
      type: 'stock_in',
      quantity: 150,
      previousStock: 0,
      newStock: 150,
      unitCost: 1200,
      reason: 'New inventory restock',
      supplier: supplierIds[0],
      performedBy: userId,
      businessId,
      createdAt: daysAgo(20),
    });

    // Peak Milk received 15 days ago
    transactionsData.push({
      product: productIds[5],
      type: 'stock_in',
      quantity: 80,
      previousStock: 0,
      newStock: 80,
      unitCost: 3400,
      reason: 'Regular bulk refill',
      supplier: supplierIds[1],
      performedBy: userId,
      businessId,
      createdAt: daysAgo(15),
    });

    // Colgate received 12 days ago
    transactionsData.push({
      product: productIds[7],
      type: 'stock_in',
      quantity: 100,
      previousStock: 0,
      newStock: 100,
      unitCost: 850,
      reason: 'New product line acquisition',
      supplier: supplierIds[1],
      performedBy: userId,
      businessId,
      createdAt: daysAgo(12),
    });

    // Coca Cola cases received 10 days ago
    transactionsData.push({
      product: productIds[3],
      type: 'stock_in',
      quantity: 40,
      previousStock: 0,
      newStock: 40,
      unitCost: 2800,
      reason: 'Supplier supply delivery',
      supplier: supplierIds[2],
      performedBy: userId,
      businessId,
      createdAt: daysAgo(10),
    });

    // Bluetooth wireless speakers received 8 days ago
    transactionsData.push({
      product: productIds[2],
      type: 'stock_in',
      quantity: 6,
      previousStock: 0,
      newStock: 6,
      unitCost: 15000,
      reason: 'High demand accessory restocking',
      supplier: supplierIds[0],
      performedBy: userId,
      businessId,
      createdAt: daysAgo(8),
    });

    // Golden Morn received 5 days ago
    transactionsData.push({
      product: productIds[6],
      type: 'stock_in',
      quantity: 20,
      previousStock: 0,
      newStock: 20,
      unitCost: 1800,
      reason: 'Initial provisions intake',
      supplier: supplierIds[1],
      performedBy: userId,
      businessId,
      createdAt: daysAgo(5),
    });

    // 2. Seeding Stock-outs (Sales / Dispatch)
    // Sold some power banks 18 days ago
    transactionsData.push({
      product: productIds[0],
      type: 'stock_out',
      quantity: 5,
      previousStock: 50,
      newStock: 45,
      reason: 'Store customer retail sale',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(18),
    });

    // Sold USB cables 15 days ago
    transactionsData.push({
      product: productIds[1],
      type: 'stock_out',
      quantity: 20,
      previousStock: 150,
      newStock: 130,
      reason: 'Bulk wholesale dispatch',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(15),
    });

    // Sold Coca Cola cases 8 days ago
    transactionsData.push({
      product: productIds[3],
      type: 'stock_out',
      quantity: 6,
      previousStock: 40,
      newStock: 34,
      reason: 'Retail checkout sales',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(8),
    });

    // Sold Peak Milk 7 days ago
    transactionsData.push({
      product: productIds[5],
      type: 'stock_out',
      quantity: 15,
      previousStock: 80,
      newStock: 65,
      reason: 'Direct client purchase order fulfillment',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(7),
    });

    // Sold USB Cables 5 days ago
    transactionsData.push({
      product: productIds[1],
      type: 'stock_out',
      quantity: 10,
      previousStock: 130,
      newStock: 120,
      reason: 'Retail checkout sales',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(5),
    });

    // Sold 2 bluetooth speakers 4 days ago
    transactionsData.push({
      product: productIds[2],
      type: 'stock_out',
      quantity: 2,
      previousStock: 6,
      newStock: 4,
      reason: 'E-commerce dispatch order',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(4),
    });

    // Sold Golden Morn 3 days ago
    transactionsData.push({
      product: productIds[6],
      type: 'stock_out',
      quantity: 12,
      previousStock: 20,
      newStock: 8,
      reason: 'Customer store sale',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(3),
    });

    // Sold Coca Cola 2 days ago
    transactionsData.push({
      product: productIds[3],
      type: 'stock_out',
      quantity: 4,
      previousStock: 34,
      newStock: 30,
      reason: 'Direct retail sale',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(2),
    });

    // Sold Colgate Toothpaste 1 day ago
    transactionsData.push({
      product: productIds[7],
      type: 'stock_out',
      quantity: 10,
      previousStock: 100,
      newStock: 90,
      reason: 'Walk-in buyer checkout',
      performedBy: userId,
      businessId,
      createdAt: daysAgo(1),
    });

    // 3. Seeding Stock Adjustments
    // Audit adjustment for Colgate Toothpaste (damaged units discarded) 3 days ago
    transactionsData.push({
      product: productIds[7],
      type: 'adjustment',
      quantity: 2,
      previousStock: 102,
      newStock: 100,
      reason: 'Damaged item disposal (expired packaging)',
      performedBy: userId,
      businessId,
      notes: 'Logged during quarterly audit',
      createdAt: daysAgo(3),
    });

    await db.collection('stocktransactions').insertMany(transactionsData);
    console.log(`- Seeded ${transactionsData.length} stock transactions.`);
  }

  console.log('Seeding process complete! Disconnecting...');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
