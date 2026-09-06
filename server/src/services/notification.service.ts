import { env } from '../config/env.js';

export type NotificationEventType = 'OrderCreated' | 'OrderStatusChanged';

export interface NotificationEvent {
  type: NotificationEventType;
  orderNumber: string;
  customerName: string;
  email: string;
  mobile: string;
  status: string;
  totalAmount: number;
  previousStatus?: string;
  timestamp: Date;
}

export interface NotificationProvider {
  name: string;
  send(event: NotificationEvent): Promise<void>;
}

/**
 * Development & Logging Notification Provider.
 * Safely outputs sanitized event notifications to the console.
 */
export class ConsoleNotificationProvider implements NotificationProvider {
  name = 'ConsoleNotificationProvider';

  async send(event: NotificationEvent): Promise<void> {
    const timestampStr = event.timestamp.toISOString();
    
    if (event.type === 'OrderCreated') {
      console.log(`\n🔔 [NOTIFICATION EVENT - ${event.type}] (${timestampStr})`);
      console.log(`   📦 Order Number: ${event.orderNumber}`);
      console.log(`   👤 Customer: ${event.customerName} (${event.mobile})`);
      console.log(`   💰 Total Amount: ₹${event.totalAmount}`);
      console.log(`   📍 Status: ${event.status}`);
    } else if (event.type === 'OrderStatusChanged') {
      console.log(`\n🔔 [NOTIFICATION EVENT - ${event.type}] (${timestampStr})`);
      console.log(`   📦 Order Number: ${event.orderNumber}`);
      console.log(`   🔄 Status Transition: ${event.previousStatus} -> ${event.status}`);
      console.log(`   👤 Customer: ${event.customerName} (${event.mobile})`);
    }
  }
}

export class TelegramNotificationProvider implements NotificationProvider {
  name = 'TelegramNotificationProvider';

  async send(event: NotificationEvent): Promise<void> {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      console.log('⚠️ Telegram notification disabled: credentials not configured.');
      return;
    }

    let message = '';

    if (event.type === 'OrderCreated') {
      message = [
        '🔔 NEW ORDER!',
        '',
        `📦 Order: #${event.orderNumber}`,
        `👤 Customer: ${event.customerName}`,
        `📱 Mobile: ${event.mobile}`,
        `💰 Total: ₹${event.totalAmount.toFixed(2)}`,
        `📍 Status: ${event.status}`,
      ].join('\n');
    } else {
      message = [
        '🔄 ORDER STATUS UPDATED',
        '',
        `📦 Order: #${event.orderNumber}`,
        `👤 Customer: ${event.customerName}`,
        `📱 Mobile: ${event.mobile}`,
        `🔄 Status: ${event.previousStatus} → ${event.status}`,
      ].join('\n');
    }

    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${errorText}`);
    }
  }
}

class NotificationServiceManager {
  private providers: NotificationProvider[] = [
    new ConsoleNotificationProvider(),
    new TelegramNotificationProvider(),
  ];

  /**
   * Safely emits an order created event to all configured notification providers.
   * Guaranteed never to throw or disrupt order creation workflows.
   */
  async sendOrderCreatedNotification(order: {
    orderNumber: string;
    customerName: string;
    email: string;
    mobile: string;
    status: string;
    totalAmount: number | any;
  }): Promise<void> {
    try {
      const event: NotificationEvent = {
        type: 'OrderCreated',
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        email: order.email,
        mobile: order.mobile,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        timestamp: new Date(),
      };

      for (const provider of this.providers) {
        await provider.send(event).catch((err) => {
          console.error(`⚠️ Notification provider '${provider.name}' failed:`, err.message);
        });
      }
    } catch (err: any) {
      console.error('⚠️ Notification service error:', err.message);
    }
  }

  /**
   * Safely emits an order status changed event.
   * Guaranteed never to throw or roll back database status changes.
   */
  async sendOrderStatusNotification(
    order: {
      orderNumber: string;
      customerName: string;
      email: string;
      mobile: string;
      totalAmount: number | any;
    },
    previousStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      const event: NotificationEvent = {
        type: 'OrderStatusChanged',
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        email: order.email,
        mobile: order.mobile,
        status: newStatus,
        previousStatus,
        totalAmount: Number(order.totalAmount),
        timestamp: new Date(),
      };

      for (const provider of this.providers) {
        await provider.send(event).catch((err) => {
          console.error(`⚠️ Notification provider '${provider.name}' failed:`, err.message);
        });
      }
    } catch (err: any) {
      console.error('⚠️ Notification service error:', err.message);
    }
  }
}

export const notificationService = new NotificationServiceManager();
