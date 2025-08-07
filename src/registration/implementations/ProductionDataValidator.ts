/**
 * 🛡️ PRODUCTION DATA VALIDATOR 🛡️
 * 
 * Ensures we NEVER accidentally use mock data in production!
 * The happiest data validator in the universe!
 */

import { getDatabaseConnection } from '../database/connection.js';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataSource: 'REAL_DATABASE' | 'FALLBACK_DATA' | 'UNKNOWN';
  timestamp: Date;
}

export class ProductionDataValidator {
  private static instance: ProductionDataValidator;
  
  static getInstance(): ProductionDataValidator {
    if (!ProductionDataValidator.instance) {
      ProductionDataValidator.instance = new ProductionDataValidator();
    }
    return ProductionDataValidator.instance;
  }
  
  async validateProductionData(): Promise<DataValidationResult> {
    const result: DataValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      dataSource: 'UNKNOWN',
      timestamp: new Date()
    };
    
    try {
      // 1. Check database connection
      const dbConnection = getDatabaseConnection();
      if (!dbConnection.isInitialized()) {
        result.errors.push('❌ Database not initialized');
        result.isValid = false;
        result.dataSource = 'FALLBACK_DATA';
        return result;
      }
      
      // 2. Verify core tables exist
      const coreTablesExist = await this.verifyCoreTablesExist();
      if (!coreTablesExist.isValid) {
        result.errors.push(...coreTablesExist.errors);
        result.warnings.push(...coreTablesExist.warnings);
        result.isValid = false;
        result.dataSource = 'FALLBACK_DATA';
        return result;
      }
      
      // 3. Check for real data (not just empty tables)
      const hasRealData = await this.verifyRealDataExists();
      if (!hasRealData.isValid) {
        result.warnings.push(...hasRealData.warnings);
        if (hasRealData.errors.length > 0) {
          result.errors.push(...hasRealData.errors);
          result.isValid = false;
        }
      }
      
      // 4. Verify environment configuration
      const envCheck = this.verifyEnvironmentConfig();
      if (!envCheck.isValid) {
        result.errors.push(...envCheck.errors);
        result.warnings.push(...envCheck.warnings);
        result.isValid = false;
      }
      
      result.dataSource = result.isValid ? 'REAL_DATABASE' : 'FALLBACK_DATA';
      
      if (result.isValid) {
        console.log('✅ PRODUCTION DATA VALIDATION PASSED! 🎉');
      } else {
        console.error('❌ PRODUCTION DATA VALIDATION FAILED!');
        console.error('Errors:', result.errors);
        console.warn('Warnings:', result.warnings);
      }
      
      return result;
      
    } catch (error) {
      result.errors.push(`Critical validation error: ${error.message}`);
      result.isValid = false;
      result.dataSource = 'FALLBACK_DATA';
      return result;
    }
  }
  
  private async verifyCoreTablesExist(): Promise<{isValid: boolean, errors: string[], warnings: string[]}> {
    const dbConnection = getDatabaseConnection();
    const result = { isValid: true, errors: [], warnings: [] };
    
    const requiredTables = [
      'users',
      'products', 
      'workshops',
      'bookings',
      'attendees'
    ];
    
    try {
      for (const table of requiredTables) {
        const rows = await dbConnection.query(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name=?
        `, [table]);
        
        if (rows.length === 0) {
          result.errors.push(`❌ Required table '${table}' does not exist`);
          result.isValid = false;
        }
      }
    } catch (error) {
      result.errors.push(`❌ Failed to verify tables: ${error.message}`);
      result.isValid = false;
    }
    
    return result;
  }
  
  private async verifyRealDataExists(): Promise<{isValid: boolean, errors: string[], warnings: string[]}> {
    const dbConnection = getDatabaseConnection();
    const result = { isValid: true, errors: [], warnings: [] };
    
    try {
      // Check if we have real products (not just the default ones)
      const productRows = await dbConnection.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
      const productCount = productRows[0]?.count || 0;
      
      if (productCount === 0) {
        result.errors.push('❌ No active products found in database');
        result.isValid = false;
      } else if (productCount < 2) {
        result.warnings.push(`⚠️ Only ${productCount} product(s) found - expected at least 2`);
      }
      
      // Check for users
      const userRows = await dbConnection.query('SELECT COUNT(*) as count FROM users');
      const userCount = userRows[0]?.count || 0;
      
      if (userCount === 0) {
        result.warnings.push('⚠️ No users found in database');
      }
      
      // Check for workshops
      const workshopRows = await dbConnection.query('SELECT COUNT(*) as count FROM workshops');
      const workshopCount = workshopRows[0]?.count || 0;
      
      if (workshopCount === 0) {
        result.warnings.push('⚠️ No workshops found in database');
      }
      
      console.log(`📊 Data counts: ${productCount} products, ${userCount} users, ${workshopCount} workshops`);
      
    } catch (error) {
      result.errors.push(`❌ Failed to verify data: ${error.message}`);
      result.isValid = false;
    }
    
    return result;
  }
  
  private verifyEnvironmentConfig(): {isValid: boolean, errors: string[], warnings: string[]} {
    const result = { isValid: true, errors: [], warnings: [] };
    
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.NETLIFY;
    const isDevelopment = !isProduction;
    
    // In production, these are required. In development, they're optional.
    const productionRequiredEnvVars = [
      'SENDGRID_API_KEY',
      'SQUARE_APPLICATION_ID'
    ];
    
    // DATABASE_URL is always optional (we have a default)
    const optionalEnvVars = [
      'DATABASE_URL', // Has default: 'file:local.db'
      'TURSO_AUTH_TOKEN',
      'SQUARE_ACCESS_TOKEN'
    ];
    
    if (isProduction) {
      // In production, check required vars
      for (const envVar of productionRequiredEnvVars) {
        if (!process.env[envVar]) {
          result.errors.push(`❌ Required environment variable '${envVar}' is not set`);
          result.isValid = false;
        }
      }
    } else {
      // In development, these are just warnings
      for (const envVar of productionRequiredEnvVars) {
        if (!process.env[envVar]) {
          result.warnings.push(`⚠️ ${envVar} not set (required for production)`);
        }
      }
    }
    
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        result.warnings.push(`⚠️ Optional environment variable '${envVar}' is not set`);
      }
    }
    
    // Check if we're in production mode
    if (process.env.NODE_ENV !== 'production' && (process.env.VERCEL || process.env.NETLIFY)) {
      result.warnings.push('⚠️ Deployed environment but NODE_ENV is not "production"');
    }
    
    return result;
  }
  
  /**
   * Force fail if using fallback data in production
   */
  async requireRealDataInProduction(): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.NETLIFY;
    
    if (!isProduction) {
      console.log('🧪 Development mode: Fallback data is acceptable');
      return;
    }
    
    const validation = await this.validateProductionData();
    
    if (!validation.isValid || validation.dataSource !== 'REAL_DATABASE') {
      const errorMsg = `🚨 PRODUCTION DEPLOYMENT BLOCKED! 🚨
      
Cannot deploy with invalid data configuration:
${validation.errors.join('\n')}

Warnings:
${validation.warnings.join('\n')}

Data Source: ${validation.dataSource}
Timestamp: ${validation.timestamp.toISOString()}

🛠️ Fix these issues before deploying to production!`;
      
      console.error(errorMsg);
      throw new Error('Production deployment blocked due to data validation failures');
    }
    
    console.log('✅ Production data validation passed! Safe to deploy! 🚀');
  }
}