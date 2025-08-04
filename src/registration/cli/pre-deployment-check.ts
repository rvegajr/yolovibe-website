#!/usr/bin/env node
/**
 * 🛡️ PRE-DEPLOYMENT SAFETY CHECK 🛡️
 * 
 * MANDATORY check before any production deployment!
 * Ensures we NEVER deploy with mock data or broken services!
 */

import { ProductionDataValidator } from '../implementations/ProductionDataValidator.js';
import { ProductionMonitor } from '../implementations/ProductionMonitor.js';
import { initializeDatabase, closeDatabaseConnection } from '../database/connection.js';
import { readFileSync } from 'fs';

// Load .env file for CLI environment
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
    // .env file not found or not readable - this is okay for production
  }
}

console.log('🛡️ PRE-DEPLOYMENT SAFETY CHECK 🛡️');
console.log('=' .repeat(50));
console.log(`🕐 Check time: ${new Date().toLocaleString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀 Platform: ${process.env.VERCEL ? 'Vercel' : process.env.NETLIFY ? 'Netlify' : 'Local'}`);
console.log('=' .repeat(50) + '\n');

async function runPreDeploymentCheck(): Promise<boolean> {
  let allChecksPassed = true;
  
  try {
    // 0. Load environment variables for CLI
    loadEnvFile();
    
    // 1. Initialize database
    console.log('🗄️ Initializing database connection...');
    await initializeDatabase();
    console.log('✅ Database connection established\n');
    
    // 2. Data validation check
    console.log('📊 STEP 1: Data Validation Check');
    console.log('-'.repeat(30));
    
    const validator = ProductionDataValidator.getInstance();
    const dataValidation = await validator.validateProductionData();
    
    if (!dataValidation.isValid) {
      allChecksPassed = false;
      console.error('❌ Data validation FAILED!');
      console.error('Errors:', dataValidation.errors);
    } else {
      console.log('✅ Data validation PASSED!');
    }
    
    if (dataValidation.warnings.length > 0) {
      console.warn('⚠️ Warnings:', dataValidation.warnings);
    }
    
    console.log(`📍 Data Source: ${dataValidation.dataSource}\n`);
    
    // 3. System health check
    console.log('🔍 STEP 2: System Health Check');
    console.log('-'.repeat(30));
    
    const monitor = ProductionMonitor.getInstance();
    const health = await monitor.performHealthCheck();
    
    if (health.overall === 'DOWN') {
      allChecksPassed = false;
      console.error('❌ System health check FAILED!');
    } else if (health.overall === 'DEGRADED') {
      console.warn('⚠️ System health is DEGRADED but deployable');
    } else {
      console.log('✅ System health check PASSED!');
    }
    
    // 4. Production-specific checks
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.NETLIFY;
    
    if (isProduction) {
      console.log('🚀 STEP 3: Production Environment Check');
      console.log('-'.repeat(30));
      
      try {
        await validator.requireRealDataInProduction();
        console.log('✅ Production data requirements PASSED!\n');
      } catch (error) {
        allChecksPassed = false;
        console.error('❌ Production data requirements FAILED!');
        console.error(error.message + '\n');
      }
    } else {
      console.log('🧪 STEP 3: Development Environment - Skipping production checks\n');
    }
    
    // 5. Critical services check
    console.log('🔧 STEP 4: Critical Services Check');
    console.log('-'.repeat(30));
    
    const criticalServices = health.checks.filter(c => 
      c.service === 'Database' || c.service === 'Email Service'
    );
    
    const failedCritical = criticalServices.filter(c => c.status === 'DOWN');
    
    if (failedCritical.length > 0) {
      allChecksPassed = false;
      console.error('❌ Critical services are DOWN:');
      failedCritical.forEach(service => {
        console.error(`  - ${service.service}: ${service.error}`);
      });
    } else {
      console.log('✅ All critical services are operational');
    }
    
    console.log('\n' + '=' .repeat(50));
    
    // Final verdict
    if (allChecksPassed) {
      console.log('🎉 ALL CHECKS PASSED! SAFE TO DEPLOY! 🚀');
      console.log('✅ Real data confirmed');
      console.log('✅ System health verified');
      console.log('✅ Critical services operational');
      console.log('=' .repeat(50) + '\n');
      return true;
    } else {
      console.error('🚨 DEPLOYMENT BLOCKED! 🚨');
      console.error('❌ One or more critical checks failed');
      console.error('🛠️ Fix the issues above before deploying');
      console.error('=' .repeat(50) + '\n');
      return false;
    }
    
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR during pre-deployment check:');
    console.error(error);
    console.error('\n🚨 DEPLOYMENT BLOCKED! 🚨\n');
    return false;
    
  } finally {
    closeDatabaseConnection();
  }
}

// Run the check and exit with appropriate code
runPreDeploymentCheck()
  .then(success => {
    if (success) {
      console.log('🎊 Ready for deployment with confidence!');
      process.exit(0); // Success
    } else {
      console.error('⛔ Deployment blocked for safety!');
      process.exit(1); // Failure
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1); // Failure
  });