import app from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 STICK SCAPE EXPRESS BACKEND RUNNING AT:`);
  console.log(`👉 http://localhost:${env.PORT}`);
  console.log(`👉 Health: http://localhost:${env.PORT}/api/health`);
  console.log(`👉 Orders: http://localhost:${env.PORT}/api/orders`);
  console.log(`👉 Products: http://localhost:${env.PORT}/api/products`);
  console.log(`==================================================\n`);
});
