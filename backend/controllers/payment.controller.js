import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { paypalClient, executePayPalRequest, isPayPalConfigured } from "../lib/paypal.js";
import paypal from '@paypal/checkout-server-sdk';

export const createPayPalOrder = async (req, res) => {
  try {
    // Check PayPal configuration first
    if (!isPayPalConfigured()) {
      return res.status(500).json({ 
        error: "PayPal not configured", 
        message: "Payment service is not properly configured" 
      });
    }

    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;
    const items = [];

    // Calculate items and total
    products.forEach((product) => {
      const itemTotal = product.price * product.quantity;
      totalAmount += itemTotal;
      
      items.push({
        name: product.name,
        unit_amount: {
          currency_code: 'USD',
          value: product.price.toFixed(2)
        },
        quantity: product.quantity.toString(),
        category: 'PHYSICAL_GOODS'
      });
    });

    // Apply coupon discount
    let coupon = null;
    let discountAmount = 0;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
      if (coupon) {
        discountAmount = (totalAmount * coupon.discountPercentage) / 100;
        totalAmount -= discountAmount;
      }
    }

    // Prepare custom data - ensure it's properly stringified
    const customData = {
      userId: req.user._id.toString(),
      couponCode: couponCode || "",
      products: products.map((p) => ({
        id: p._id,
        quantity: p.quantity,
        price: p.price,
      }))
    };

    console.log("Custom data being sent:", customData); // Debug log

    // Build PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        return_url: `${process.env.CLIENT_URL}/purchase-success`,
        cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
        brand_name: 'Sassou Essence',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW'
      },
      purchase_units: [{
        reference_id: `order_${Date.now()}`,
        custom_id: JSON.stringify(customData), // This should now be properly stringified
        amount: {
          currency_code: 'USD',
          value: totalAmount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)
            },
            ...(discountAmount > 0 && {
              discount: {
                currency_code: 'USD',
                value: discountAmount.toFixed(2)
              }
            })
          }
        },
        items: items
      }]
    });

    const order = await executePayPalRequest(request);

    // Create coupon for orders >= $200
    if (totalAmount >= 200) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({ 
      id: order.result.id, 
      totalAmount: totalAmount,
      approvalUrl: order.result.links.find(link => link.rel === 'approve').href
    });

  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({ message: "Error creating PayPal order", error: error.message });
  }
};

export const capturePayPalOrder = async (req, res) => {
  try {
    // Check PayPal configuration first
    if (!isPayPalConfigured()) {
      return res.status(500).json({ 
        error: "PayPal not configured", 
        message: "Payment service is not properly configured" 
      });
    }

    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    
    console.log("Capturing PayPal order:", orderId); // Debug log
    
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    
    const capture = await executePayPalRequest(request);
    
    console.log("PayPal capture response:", JSON.stringify(capture.result, null, 2)); // Debug log
    
    if (capture.result.status === 'COMPLETED') {
      // Initialize default values
      let customData = {
        userId: null,
        couponCode: "",
        products: []
      };
      
      // Safely parse custom_id with comprehensive error handling
      try {
        const purchaseUnit = capture.result.purchase_units?.[0];
        if (!purchaseUnit) {
          throw new Error("No purchase unit found in capture response");
        }
        
        const customId = purchaseUnit.custom_id;
        console.log("Raw custom_id:", customId, "Type:", typeof customId); // Debug log
        
        if (customId && customId !== 'undefined' && customId !== 'null' && customId.trim() !== '') {
          customData = JSON.parse(customId);
          console.log("Parsed custom data:", customData); // Debug log
        } else {
          console.warn("Custom ID is empty, undefined, or invalid:", customId);
        }
      } catch (parseError) {
        console.error("Error parsing custom_id:", parseError);
        console.log("Continuing with default custom data");
      }
      
      // Deactivate coupon if used and valid
      if (customData.couponCode && customData.userId) {
        try {
          const updatedCoupon = await Coupon.findOneAndUpdate(
            {
              code: customData.couponCode,
              userId: customData.userId,
              isActive: true
            },
            {
              isActive: false,
            },
            { new: true }
          );
          console.log("Coupon updated:", updatedCoupon ? "Success" : "Not found"); // Debug log
        } catch (couponError) {
          console.error("Error updating coupon:", couponError);
        }
      }

      // Create new Order with fallback values
      const orderData = {
        user: customData.userId || req.user?._id, // Fallback to request user if available
        products: customData.products?.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })) || [],
        totalAmount: parseFloat(capture.result.purchase_units[0].amount.value),
        paypalOrderId: orderId,
      };

      console.log("Creating order with data:", orderData); // Debug log

      const newOrder = new Order(orderData);
      await newOrder.save();

      res.status(200).json({
        success: true,
        message: "Payment successful and order created.",
        orderId: newOrder._id,
      });
    } else {
      console.log("Payment not completed. Status:", capture.result.status);
      res.status(400).json({ message: "Payment not completed", status: capture.result.status });
    }

  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    console.error("Error stack:", error.stack); // More detailed error info
    res.status(500).json({ 
      message: "Error capturing PayPal order", 
      error: error.message,
      orderId: req.body.orderId // Include the problematic order ID for debugging
    });
  }
};

// Helper function remains the same
async function createNewCoupon(userId) {
  try {
    await Coupon.findOneAndDelete({ userId });

    const newCoupon = new Coupon({
      code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      userId: userId,
    });

    await newCoupon.save();
    console.log("New coupon created:", newCoupon.code); // Debug log
    return newCoupon;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
}