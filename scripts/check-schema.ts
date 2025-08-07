import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
config();

async function checkSchema() {
  console.log('🔍 Checking database schema...');
  
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    // Check products table schema
    const schema = await client.execute("PRAGMA table_info(products)");
    
    console.log('\n📊 Products table schema:');
    console.log('─'.repeat(60));
    schema.rows.forEach(row => {
      console.log(`${row.name} (${row.type}) - ${row.notnull ? 'NOT NULL' : 'NULL'} - ${row.dflt_value ? `Default: ${row.dflt_value}` : 'No default'}`);
    });

    // Check workshops table schema
    const workshopSchema = await client.execute("PRAGMA table_info(workshops)");
    
    console.log('\n📅 Workshops table schema:');
    console.log('─'.repeat(60));
    workshopSchema.rows.forEach(row => {
      console.log(`${row.name} (${row.type}) - ${row.notnull ? 'NOT NULL' : 'NULL'} - ${row.dflt_value ? `Default: ${row.dflt_value}` : 'No default'}`);
    });

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await client.close();
  }
}

checkSchema().catch(console.error);