import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
config();

async function checkProducts() {
  console.log('🔍 Checking available products in database...');
  
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    const result = await client.execute('SELECT * FROM products');
    
    console.log(`\n📊 Found ${result.rows.length} products:`);
    console.log('─'.repeat(80));
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Price: $${row.price}`);
      console.log(`   Type: ${row.type}`);
      console.log(`   Description: ${row.description}`);
      console.log(`   Status: ${row.status}`);
      console.log('─'.repeat(40));
    });

    // Also check workshops table
    const workshopResult = await client.execute('SELECT * FROM workshops');
    console.log(`\n📅 Found ${workshopResult.rows.length} workshops:`);
    console.log('─'.repeat(80));
    
    workshopResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.title}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Product ID: ${row.product_id}`);
      console.log(`   Start Date: ${row.start_date}`);
      console.log(`   Duration: ${row.duration_days} days`);
      console.log(`   Status: ${row.status}`);
      console.log('─'.repeat(40));
    });

  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await client.close();
  }
}

checkProducts().catch(console.error);