import { SquareService } from './src/infrastructure/payment/SquareService.js';
import { readFileSync } from 'fs';

// Load .env file manually
function loadEnvFile() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Could not load .env file:', error.message);
  }
}

async function testSquareConfig() {
  console.log('🔧 Loading environment variables...');
  loadEnvFile();
  console.log('🎯 Testing Square Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   SQUARE_APPLICATION_ID: ${process.env.SQUARE_APPLICATION_ID ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   SQUARE_ACCESS_TOKEN: ${process.env.SQUARE_ACCESS_TOKEN ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   SQUARE_ENVIRONMENT: ${process.env.SQUARE_ENVIRONMENT || 'NOT SET'}`);
  console.log(`   SQUARE_LOCATION_ID: ${process.env.SQUARE_LOCATION_ID || 'NOT SET'}`);
  
  if (!process.env.SQUARE_APPLICATION_ID || !process.env.SQUARE_ACCESS_TOKEN) {
    console.log('\n❌ Missing required Square credentials!');
    console.log('📝 Please update your .env file with your Square Application ID');
    return;
  }
  
  console.log('\n🧪 Testing Square Service...');
  try {
    // Create config object from environment variables
    const config = {
      square: {
        applicationId: process.env.SQUARE_APPLICATION_ID,
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
        locationId: process.env.SQUARE_LOCATION_ID
      }
    };
    
    const squareService = new SquareService(config);
    console.log('✅ SquareService instantiated successfully');
    
    // Test connection validation
    console.log('🔍 Testing Square API connection...');
    const validation = await squareService.validateConnection();
    
    if (validation.valid) {
      console.log('✅ Square connection is VALID!');
      if (validation.location) {
        console.log(`📍 Location: ${validation.location.name} (${validation.location.id})`);
      }
    } else {
      console.log('❌ Square connection FAILED:');
      console.log(`   Error: ${validation.error}`);
    }
    
  } catch (error) {
    console.log('❌ Error testing Square service:', error.message);
  }
}

testSquareConfig();