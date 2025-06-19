/**
 * Application Configuration Module
 * Loads and validates environment variables with fail-fast behavior
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Define AppConfig interface here to avoid circular imports
export interface AppConfig {
  auth0: {
    domain: string;
    clientId: string;
    clientSecret: string;
  };
  sendgrid: {
    apiKey: string;
    fromEmail: string;
  };
  square: {
    accessToken: string;
    environment: 'sandbox' | 'production';
    locationId: string;
  };
  google: {
    // Service account authentication (legacy)
    serviceAccountKeyPath?: string;
    
    // OAuth client authentication
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    
    // Application Default Credentials (preferred for deployment)
    useApplicationDefaultCredentials?: boolean;
    
    // Development options
    skipCheck?: boolean;
    
    // Required for all auth methods
    calendarId: string;
  };
  app: {
    nodeEnv: string;
    port: number;
  };
}

// Load environment variables
dotenv.config();

interface EnvVar {
  name: string;
  value: string | undefined;
  required: boolean;
  description: string;
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

class ConfigLoader {
  private envVars: EnvVar[] = [
    {
      name: 'AUTH0_DOMAIN',
      value: process.env.AUTH0_DOMAIN,
      required: true,
      description: 'Auth0 tenant domain (e.g., your-tenant.auth0.com)',
    },
    {
      name: 'AUTH0_CLIENT_ID',
      value: process.env.AUTH0_CLIENT_ID,
      required: true,
      description: 'Auth0 application client ID',
    },
    {
      name: 'AUTH0_CLIENT_SECRET',
      value: process.env.AUTH0_CLIENT_SECRET,
      required: true,
      description: 'Auth0 application client secret',
    },
    {
      name: 'SENDGRID_API_KEY',
      value: process.env.SENDGRID_API_KEY,
      required: true,
      description: 'SendGrid API key for email delivery',
    },
    {
      name: 'SENDGRID_FROM_EMAIL',
      value: process.env.SENDGRID_FROM_EMAIL,
      required: true,
      description: 'Verified sender email address in SendGrid',
    },
    {
      name: 'SQUARE_ACCESS_TOKEN',
      value: process.env.SQUARE_ACCESS_TOKEN,
      required: true,
      description: 'Square payment processing access token',
    },
    {
      name: 'SQUARE_LOCATION_ID',
      value: process.env.SQUARE_LOCATION_ID,
      required: true,
      description: 'Square location ID for payment processing',
    },
    {
      name: 'SQUARE_ENVIRONMENT',
      value: process.env.SQUARE_ENVIRONMENT || 'sandbox',
      required: false,
      description: 'Square environment (sandbox or production)',
    },
    {
      name: 'GOOGLE_CALENDAR_ID',
      value: process.env.GOOGLE_CALENDAR_ID,
      required: true,
      description: 'Google Calendar ID for workshop scheduling',
    },
    {
      name: 'GOOGLE_SERVICE_ACCOUNT_KEY_PATH',
      value: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      required: false,
      description: 'Path to Google service account key file',
    },
    {
      name: 'GOOGLE_CLIENT_ID',
      value: process.env.GOOGLE_CLIENT_ID,
      required: false,
      description: 'Google OAuth client ID',
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      value: process.env.GOOGLE_CLIENT_SECRET,
      required: false,
      description: 'Google OAuth client secret',
    },
    {
      name: 'GOOGLE_REFRESH_TOKEN',
      value: process.env.GOOGLE_REFRESH_TOKEN,
      required: false,
      description: 'Google OAuth refresh token',
    },
    {
      name: 'USE_APPLICATION_DEFAULT_CREDENTIALS',
      value: process.env.USE_APPLICATION_DEFAULT_CREDENTIALS || 'true',
      required: false,
      description: 'Use Google Application Default Credentials (true/false)',
    },
    {
      name: 'SKIP_GOOGLE_CALENDAR_CHECK',
      value: process.env.SKIP_GOOGLE_CALENDAR_CHECK || 'false',
      required: false,
      description: 'Skip Google Calendar validation check (true/false)',
    },
    {
      name: 'NODE_ENV',
      value: process.env.NODE_ENV || 'development',
      required: false,
      description: 'Application environment (development, production, test)',
    },
    {
      name: 'PORT',
      value: process.env.PORT || '3000',
      required: false,
      description: 'Server port number',
    },
  ];

  /**
   * Validates all environment variables and returns typed configuration
   * Throws ConfigurationError if any required variables are missing
   */
  loadAndValidate(): AppConfig & {
    nodeEnv: string;
    port: number;
    isDevelopment: boolean;
    isProduction: boolean;
  } {
    this.validateRequired();
    this.validateFormats();

    // Parse boolean values from env vars
    const useADC = (this.get('USE_APPLICATION_DEFAULT_CREDENTIALS') || 'true') === 'true';
    const skipGoogleCheck = (this.get('SKIP_GOOGLE_CALENDAR_CHECK') || 'false') === 'true';

    const config = {
      auth0: {
        domain: this.getRequired('AUTH0_DOMAIN'),
        clientId: this.getRequired('AUTH0_CLIENT_ID'),
        clientSecret: this.getRequired('AUTH0_CLIENT_SECRET'),
      },
      sendgrid: {
        apiKey: this.getRequired('SENDGRID_API_KEY'),
        fromEmail: this.getRequired('SENDGRID_FROM_EMAIL'),
      },
      square: {
        accessToken: this.getRequired('SQUARE_ACCESS_TOKEN'),
        locationId: this.getRequired('SQUARE_LOCATION_ID'),
        environment: this.get('SQUARE_ENVIRONMENT') as 'sandbox' | 'production',
      },
      google: {
        calendarId: this.getRequired('GOOGLE_CALENDAR_ID'),
        serviceAccountKeyPath: this.get('GOOGLE_SERVICE_ACCOUNT_KEY_PATH'),
        clientId: this.get('GOOGLE_CLIENT_ID'),
        clientSecret: this.get('GOOGLE_CLIENT_SECRET'),
        refreshToken: this.get('GOOGLE_REFRESH_TOKEN'),
        useApplicationDefaultCredentials: useADC,
        skipCheck: skipGoogleCheck,
      },
      app: {
        nodeEnv: this.get('NODE_ENV') || 'development',
        port: parseInt(this.get('PORT') || '3000', 10),
      },
      nodeEnv: this.get('NODE_ENV') || 'development',
      port: parseInt(this.get('PORT') || '3000', 10),
      isDevelopment: this.get('NODE_ENV') === 'development',
      isProduction: this.get('NODE_ENV') === 'production',
    };

    // Additional validation
    if (!useADC && config.google.serviceAccountKeyPath) {
      this.validateGoogleKeyFile(config.google.serviceAccountKeyPath);
    }
    this.validateSquareEnvironment(config.square.environment);
    this.validateEmailFormat(config.sendgrid.fromEmail);

    return config;
  }

  private validateRequired(): void {
    const missing = this.envVars
      .filter(env => env.required && !env.value)
      .map(env => `${env.name}: ${env.description}`);

    if (missing.length > 0) {
      throw new ConfigurationError(
        `Missing required environment variables:\n${missing.join('\n')}\n\n` +
          `Please check your .env file and ensure all required variables are set.`
      );
    }
  }

  private validateFormats(): void {
    const errors: string[] = [];

    // Validate Auth0 domain format
    const auth0Domain = this.get('AUTH0_DOMAIN');
    if (auth0Domain && !auth0Domain.includes('.auth0.com') && !auth0Domain.includes('.')) {
      errors.push('AUTH0_DOMAIN must be a valid domain (e.g., your-tenant.auth0.com)');
    }

    // Validate port number
    const port = this.get('PORT');
    if (
      port &&
      (isNaN(parseInt(port, 10)) || parseInt(port, 10) < 1 || parseInt(port, 10) > 65535)
    ) {
      errors.push('PORT must be a valid port number (1-65535)');
    }

    if (errors.length > 0) {
      throw new ConfigurationError(`Configuration validation errors:\n${errors.join('\n')}`);
    }
  }

  private validateGoogleKeyFile(keyPath: string): void {
    // Skip validation if keyPath is not provided
    if (!keyPath) return;
    
    try {
      const keyContent = readFileSync(keyPath, 'utf8');
      JSON.parse(keyContent);
    } catch (error) {
      throw new Error(
        `Failed to parse Google service account key file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private validateSquareEnvironment(environment: string): void {
    if (!['sandbox', 'production'].includes(environment)) {
      throw new ConfigurationError(
        `SQUARE_ENVIRONMENT must be either 'sandbox' or 'production', got: ${environment}`
      );
    }
  }

  private validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ConfigurationError(
        `SENDGRID_FROM_EMAIL must be a valid email address, got: ${email}`
      );
    }
  }

  private get(name: string): string | undefined {
    return this.envVars.find(env => env.name === name)?.value;
  }

  private getRequired(name: string): string {
    const value = this.get(name);
    if (!value) {
      throw new ConfigurationError(`Required environment variable ${name} is not set`);
    }
    return value;
  }

  /**
   * Prints configuration summary (without sensitive values)
   */
  printConfigSummary(config: ReturnType<ConfigLoader['loadAndValidate']>): void {
    console.log('📋 Configuration Summary:');
    console.log('========================');
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Port: ${config.port}`);
    console.log(`Auth0 Domain: ${config.auth0.domain}`);
    console.log(`SendGrid From: ${config.sendgrid.fromEmail}`);
    console.log(`Square Environment: ${config.square.environment}`);
    console.log(`Google Calendar: ${config.google.calendarId}`);
    
    // Show Google auth method
    if (config.google.useApplicationDefaultCredentials) {
      console.log(`Google Auth: Application Default Credentials`);
    } else if (config.google.serviceAccountKeyPath) {
      console.log(`Google Auth: Service Account (${config.google.serviceAccountKeyPath})`);
    } else if (config.google.clientId && config.google.refreshToken) {
      console.log(`Google Auth: OAuth2 Client`);
    } else {
      console.log(`Google Auth: Not configured properly`);
    }
    
    console.log('');
  }
}

// Export singleton instance
export const configLoader = new ConfigLoader();

// Export the configuration loading function
export function loadConfig() {
  try {
    const config = configLoader.loadAndValidate();

    if (config.isDevelopment) {
      configLoader.printConfigSummary(config);
    }

    return config;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error('❌ Configuration Error:');
      console.error(error.message);
      console.error('\n💡 Tip: Check your .env file and compare it with .env.example');
      process.exit(1);
    }
    throw error;
  }
}

export { ConfigurationError };
