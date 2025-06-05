import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { capturePayPalOrder, createPayPalOrder } from "../controllers/payment.controller.js";

const router = express.Router();

// Request timeout middleware for payment routes
const setPaymentTimeout = (req, res, next) => {
  // Set a 30-second timeout for payment operations
  req.setTimeout(30000, () => {
    console.error(`Payment request timeout for ${req.path}`);
    if (!res.headersSent) {
      res.status(408).json({ 
        error: 'Request timeout',
        message: 'Payment request took too long to process'
      });
    }
  });
  
  // Also set response timeout
  res.setTimeout(30000, () => {
    console.error(`Payment response timeout for ${req.path}`);
    if (!res.headersSent) {
      res.status(408).json({ 
        error: 'Response timeout',
        message: 'Payment response took too long to send'
      });
    }
  });
  
  next();
};

// Error handling middleware for payment routes
const handlePaymentErrors = (error, req, res, next) => {
  console.error('Payment route error:', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  // Handle specific PayPal errors
  if (error.name === 'PayPalHttpError') {
    return res.status(error.statusCode || 500).json({
      error: 'PayPal API Error',
      message: error.message,
      details: error.details || 'Unknown PayPal error'
    });
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
    return res.status(408).json({
      error: 'Connection timeout',
      message: 'Request was interrupted or timed out'
    });
  }
  
  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  
  // Generic error response
  res.status(500).json({
    error: 'Payment processing error',
    message: error.message || 'An unexpected error occurred'
  });
};

// Apply middleware to all payment routes
router.use(setPaymentTimeout);

// Payment routes with enhanced error handling
router.post("/create-paypal-order", protectRoute, async (req, res, next) => {
  try {
    await createPayPalOrder(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/capture-paypal-order", protectRoute, async (req, res, next) => {
  try {
    await capturePayPalOrder(req, res);
  } catch (error) {
    next(error);
  }
});

// Health check endpoint for payment service
router.get("/health", (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Payment Service',
    timestamp: new Date().toISOString(),
    paypal_configured: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
  });
});

// GET route to show available endpoints (for debugging)
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Payment API Endpoints",
    endpoints: {
      "POST /api/payments/create-paypal-order": "Create a new PayPal order",
      "POST /api/payments/capture-paypal-order": "Capture a PayPal order",
      "GET /api/payments/health": "Check service health"
    },
    note: "All POST endpoints require authentication"
  });
});

// Apply error handling middleware
router.use(handlePaymentErrors);

export default router;