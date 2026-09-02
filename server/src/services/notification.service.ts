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

class NotificationServiceManager {
  private providers: NotificationProvider[] = [new ConsoleNotificationProvider()];

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
