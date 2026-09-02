import express from 'express';
import cors from 'cors';
import { getAllOrdersFromDb, insertOrderToDb, updateOrderStatusInDb } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing with high payload limit for uploaded images
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'SQLite 3 Connected', message: 'Stick Scape Studio Backend Server Running 🚀' });
});

// GET /api/orders - Fetch all orders from SQLite Database
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getAllOrdersFromDb();
    res.json({ success: true, count: orders.length, database: 'SQLite 3', data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders - Insert a new order into SQLite Database
app.post('/api/orders', async (req, res) => {
  try {
    const { 
      productId, 
      customerName, 
      customerMobile, 
      customerAddress, 
      customerUploadedImage, 
      amountPaid,
      orderId,
      customer,
      items,
      total,
      paymentMethod,
      status
    } = req.body;

    const newOrder = await insertOrderToDb({
      productId,
      customerName,
      customerMobile,
      customerAddress,
      customerUploadedImage,
      amountPaid,
      orderId,
      customer,
      items,
      total,
      paymentMethod,
      status
    });

    console.log(`[SQLITE INSERT] Order #${newOrder.orderId} - ₹${newOrder.amountPaid} for ${newOrder.customerName} (${newOrder.customerMobile})`);

    res.status(201).json({
      success: true,
      message: 'Order saved successfully to SQLite Database! 📦',
      data: newOrder
    });
  } catch (err) {
    console.error('Failed to create order in SQLite:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order status in SQLite Database
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status field is required' });
    }

    const updated = await updateOrderStatusInDb(id, status);
    res.json({ success: true, message: `Order #${id} status updated to ${status} in SQLite`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/upload - Handle image upload
app.post('/api/upload', (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }
    res.json({ success: true, imageUrl: imageData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 STICK SCAPE SQLITE BACKEND SERVER RUNNING AT:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 API Orders: http://localhost:${PORT}/api/orders`);
  console.log(`==================================================\n`);
});
