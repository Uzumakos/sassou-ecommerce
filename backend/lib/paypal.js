// paypal.js - Enhanced PayPal client setup with error handling
import paypal from '@paypal/checkout-server-sdk';
import dotenv from "dotenv";

dotenv.config();

// Validate environment variables
function validateConfig() {
  const requiredVars = [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required PayPal environment variables: ${missing.join(', ')}`);
  }
  
  // Log configuration status (without exposing secrets)
  console.log('PayPal Configuration:');
  console.log('- Environment:', process.env.NODE_ENV || 'development');
  console.log('- Client ID:', process.env.PAYPAL_CLIENT_ID ? `${process.env.PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'Not set');
  console.log('- Client Secret:', process.env.PAYPAL_CLIENT_SECRET ? 'Set' : 'Not set');
}

function createEnvironment() {
  try {
    validateConfig();
    
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('Using PayPal Live Environment');
      return new paypal.core.LiveEnvironment(clientId, clientSecret);
    } else {
      console.log('Using PayPal Sandbox Environment');
      return new paypal.core.SandboxEnvironment(clientId, clientSecret);
    }
  } catch (error) {
    console.error('PayPal configuration error:', error.message);
    throw error;
  }
}

// Create PayPal client with error handling
let paypalClient;

try {
  const environment = createEnvironment();
  paypalClient = new paypal.core.PayPalHttpClient(environment);
  
  // Test the client configuration
  console.log('PayPal client initialized successfully');
  
} catch (error) {
  console.error('Failed to initialize PayPal client:', error.message);
  
  // Create a mock client for development if configuration fails
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Creating mock PayPal client for development');
    paypalClient = {
      execute: async () => {
        throw new Error('PayPal client not properly configured. Please check your environment variables.');
      }
    };
  } else {
    throw error; // Don't allow production to start with bad config
  }
}

// Helper function to check if PayPal is properly configured
export const isPayPalConfigured = () => {
  try {
    return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  } catch {
    return false;
  }
};

// Helper function to get PayPal environment info
export const getPayPalEnvironmentInfo = () => {
  return {
    isConfigured: isPayPalConfigured(),
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
    hasClientId: !!process.env.PAYPAL_CLIENT_ID,
    hasClientSecret: !!process.env.PAYPAL_CLIENT_SECRET
  };
};

// Enhanced error handling wrapper for PayPal operations
export const executePayPalRequest = async (request) => {
  try {
    if (!isPayPalConfigured()) {
      throw new Error('PayPal is not properly configured. Please check your environment variables.');
    }
    
    console.log(`Executing PayPal request: ${request.constructor.name}`);
    const startTime = Date.now();
    
    const response = await paypalClient.execute(request);
    
    const duration = Date.now() - startTime;
    console.log(`PayPal request completed in ${duration}ms`);
    
    return response;
    
  } catch (error) {
    console.error('PayPal request failed:', {
      error: error.message,
      statusCode: error.statusCode,
      details: error.details || 'No additional details'
    });
    
    // Re-throw with enhanced error information
    const enhancedError = new Error(`PayPal API Error: ${error.message}`);
    enhancedError.name = 'PayPalHttpError';
    enhancedError.statusCode = error.statusCode;
    enhancedError.details = error.details;
    enhancedError.originalError = error;
    
    throw enhancedError;
  }
};

export { paypalClient };