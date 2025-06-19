#!/usr/bin/env tsx

import { program } from 'commander';
import chalk from 'chalk';
import { configLoader } from '../src/infrastructure/config';
import { HealthChecker } from '../src/infrastructure/health/HealthChecker';
import { SquareService } from '../src/infrastructure/payment/SquareService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure the CLI
program
  .name('validate-integrations')
  .description('Validate all external service integrations')
  .version('1.0.0')
  .option('-v, --verbose', 'Show detailed output')
  .option('-s, --skip-email', 'Skip email validation')
  .option('-c, --ci', 'Run in CI mode (no interactive prompts)')
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    console.log(chalk.blue('🔍 Validating external service integrations...'));
    
    // Load configuration
    const config = configLoader.loadAndValidate();
    
    // Initialize Square service
    const squareService = new SquareService(config);
    
    // Initialize health checker
    const healthChecker = new HealthChecker(config, squareService);
    
    // Check all services
    console.log(chalk.blue('Checking service connectivity...'));
    const results = await healthChecker.checkAllServices();
    
    // Display results
    let hasErrors = false;
    
    results.forEach(result => {
      const statusIcon = result.status === 'healthy' ? chalk.green('✓') : chalk.red('✗');
      const statusText = result.status === 'healthy' ? chalk.green('HEALTHY') : chalk.red('ERROR');
      
      console.log(`${statusIcon} ${chalk.bold(result.service)}: ${statusText}`);
      
      if (result.status !== 'healthy') {
        hasErrors = true;
        console.log(`  ${chalk.red(result.message)}`);
        
        // For Square location ID errors, list available locations
        if (result.service === 'Square' && result.message.includes('not found in available locations')) {
          console.log(chalk.yellow('\nAvailable Square Locations:'));
          // Fetch and display available locations
          squareService.listLocations().then(locations => {
            if (locations.length === 0) {
              console.log(chalk.yellow('  No locations found in this Square account.'));
              console.log(chalk.yellow('  Please create a location in your Square Dashboard first.'));
            } else {
              locations.forEach(location => {
                console.log(chalk.yellow(`  ID: ${location.id} - Name: ${location.name}`));
              });
              console.log(chalk.yellow('\nUpdate your SQUARE_LOCATION_ID in .env to one of these IDs'));
            }
          }).catch(err => {
            console.log(chalk.red(`  Error fetching locations: ${err.message}`));
          });
        }
      } else if (options.verbose) {
        console.log(`  ${chalk.gray(result.message)}`);
      }
    });
    
    // Summary
    console.log('');
    if (hasErrors) {
      console.log(chalk.red('❌ Validation failed: One or more services have connectivity issues.'));
      process.exit(1);
    } else {
      console.log(chalk.green('✅ All services validated successfully!'));
    }
  } catch (error) {
    console.error(chalk.red('Error during validation:'));
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
