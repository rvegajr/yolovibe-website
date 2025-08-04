/**
 * 📊 PRODUCTION MONITORING SYSTEM 📊
 * 
 * Real-time monitoring to ensure everything works perfectly!
 * The happiest monitoring system in the universe!
 */

import { ProductionDataValidator } from './ProductionDataValidator.js';
import { getDatabaseConnection } from '../database/connection.js';

export interface HealthCheck {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  responseTime: number;
  error?: string;
  timestamp: Date;
}

export interface SystemHealth {
  overall: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  checks: HealthCheck[];
  dataValidation: any;
  uptime: number;
  timestamp: Date;
}

export class ProductionMonitor {
  private static instance: ProductionMonitor;
  private startTime: Date = new Date();
  
  static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor();
    }
    return ProductionMonitor.instance;
  }
  
  async performHealthCheck(): Promise<SystemHealth> {
    console.log('🔍 Performing comprehensive health check...');
    
    const checks: HealthCheck[] = [];
    
    // 1. Database Health
    checks.push(await this.checkDatabase());
    
    // 2. Email Service Health
    checks.push(await this.checkEmailService());
    
    // 3. Payment Service Health
    checks.push(await this.checkPaymentService());
    
    // 4. API Endpoints Health
    checks.push(await this.checkAPIEndpoints());
    
    // 5. Data Validation
    const dataValidation = await ProductionDataValidator.getInstance().validateProductionData();
    
    // Determine overall health
    const failedChecks = checks.filter(c => c.status === 'DOWN');
    const degradedChecks = checks.filter(c => c.status === 'DEGRADED');
    
    let overall: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';
    
    if (failedChecks.length > 0 || !dataValidation.isValid) {
      overall = 'DOWN';
    } else if (degradedChecks.length > 0 || dataValidation.warnings.length > 0) {
      overall = 'DEGRADED';
    }
    
    const health: SystemHealth = {
      overall,
      checks,
      dataValidation,
      uptime: Date.now() - this.startTime.getTime(),
      timestamp: new Date()
    };
    
    // Log results
    this.logHealthStatus(health);
    
    return health;
  }
  
  private async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      const dbConnection = getDatabaseConnection();
      
      if (!dbConnection.isInitialized()) {
        return {
          service: 'Database',
          status: 'DOWN',
          responseTime: Date.now() - start,
          error: 'Database not initialized',
          timestamp: new Date()
        };
      }
      
      // Test query
      await dbConnection.query('SELECT 1');
      
      return {
        service: 'Database',
        status: 'HEALTHY',
        responseTime: Date.now() - start,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        service: 'Database',
        status: 'DOWN',
        responseTime: Date.now() - start,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
  
  private async checkEmailService(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Check if SendGrid API key is configured
      if (!process.env.SENDGRID_API_KEY) {
        return {
          service: 'Email Service',
          status: 'DOWN',
          responseTime: Date.now() - start,
          error: 'SendGrid API key not configured',
          timestamp: new Date()
        };
      }
      
      // In a real implementation, you might ping SendGrid's API
      // For now, we'll just check configuration
      return {
        service: 'Email Service',
        status: 'HEALTHY',
        responseTime: Date.now() - start,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        service: 'Email Service',
        status: 'DOWN',
        responseTime: Date.now() - start,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
  
  private async checkPaymentService(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Check Square configuration
      if (!process.env.***REMOVED***) {
        return {
          service: 'Payment Service',
          status: 'DEGRADED',
          responseTime: Date.now() - start,
          error: 'Square Application ID not configured',
          timestamp: new Date()
        };
      }
      
      return {
        service: 'Payment Service',
        status: 'HEALTHY',
        responseTime: Date.now() - start,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        service: 'Payment Service',
        status: 'DOWN',
        responseTime: Date.now() - start,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
  
  private async checkAPIEndpoints(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // In a real implementation, you might make HTTP requests to your own endpoints
      // For now, we'll assume they're healthy if the server is running
      return {
        service: 'API Endpoints',
        status: 'HEALTHY',
        responseTime: Date.now() - start,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        service: 'API Endpoints',
        status: 'DOWN',
        responseTime: Date.now() - start,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
  
  private logHealthStatus(health: SystemHealth): void {
    const statusEmoji = {
      'HEALTHY': '✅',
      'DEGRADED': '⚠️',
      'DOWN': '❌'
    };
    
    console.log(`\n${statusEmoji[health.overall]} SYSTEM HEALTH: ${health.overall}`);
    console.log(`🕐 Uptime: ${Math.round(health.uptime / 1000)}s`);
    console.log(`📊 Data Source: ${health.dataValidation.dataSource}`);
    
    console.log('\n🔍 Service Status:');
    for (const check of health.checks) {
      const emoji = statusEmoji[check.status];
      console.log(`  ${emoji} ${check.service}: ${check.status} (${check.responseTime}ms)`);
      if (check.error) {
        console.log(`    Error: ${check.error}`);
      }
    }
    
    if (health.dataValidation.errors.length > 0) {
      console.log('\n❌ Data Validation Errors:');
      health.dataValidation.errors.forEach(error => console.log(`  ${error}`));
    }
    
    if (health.dataValidation.warnings.length > 0) {
      console.log('\n⚠️ Data Validation Warnings:');
      health.dataValidation.warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    console.log(''); // Empty line for readability
  }
  
  /**
   * Start continuous monitoring (for production)
   */
  startContinuousMonitoring(intervalMinutes: number = 5): void {
    console.log(`🚀 Starting continuous monitoring (every ${intervalMinutes} minutes)...`);
    
    // Initial check
    this.performHealthCheck();
    
    // Set up interval
    setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        
        // Alert if system is down
        if (health.overall === 'DOWN') {
          console.error('🚨 CRITICAL: System is DOWN! Immediate attention required!');
          // In production, you'd send alerts here (email, Slack, PagerDuty, etc.)
        }
        
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }
}