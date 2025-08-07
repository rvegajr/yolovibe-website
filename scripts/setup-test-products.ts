import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
config();

async function setupTestProducts() {
  console.log('🛠️ Setting up test products for end-to-end testing...');
  
  const client = createClient({
    url: process.env.***REMOVED***!,
    authToken: process.env.***REMOVED***!,
  });

  try {
    // Add consulting product if it doesn't exist
    const consultingResult = await client.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: ['prod-consulting']
    });

    if (consultingResult.rows.length === 0) {
      console.log('➕ Adding consulting product...');
      await client.execute({
        sql: `INSERT INTO products (id, name, description, price, product_type, duration_hours, is_active) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'prod-consulting',
          'Personal Consulting Hours',
          'One-on-one consulting session with YOLO expert',
          150.00,
          'HOURLY_CONSULTING',
          1,
          true
        ]
      });
      console.log('✅ Consulting product added');
    } else {
      console.log('ℹ️ Consulting product already exists');
    }

    // Verify all products
    const allProducts = await client.execute('SELECT * FROM products ORDER BY price');
    
    console.log('\n📊 Current products available for testing:');
    console.log('─'.repeat(80));
    
    allProducts.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Price: $${row.price}`);
      console.log(`   Type: ${row.type}`);
      console.log(`   Status: ${row.status}`);
      console.log('─'.repeat(40));
    });

    console.log('\n✅ Test products setup complete!');

  } catch (error) {
    console.error('❌ Error setting up test products:', error);
  } finally {
    await client.close();
  }
}

setupTestProducts().catch(console.error);