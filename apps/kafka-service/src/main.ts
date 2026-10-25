import 'dotenv/config';
import { kafka } from '../../../packages/utils/kafka/index';
import {
  updateShopAnalytics,
  updateUserAnalytics,
} from './services/analytics.service';

const consumer = kafka.consumer({ groupId: 'user-events-group' });

const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) return;
  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    console.log(`Processing event: ${JSON.stringify(event)}`);

    if (event.action === 'shop_visit') {
      try {
        await updateShopAnalytics(event);
      } catch (error) {
        console.error(`Error updating shop analytics:`, error);
      }
      continue;
    }

    const validateActions = [
      'add_to_wishList',
      'add_to_wishlist',
      'remove_from_wishList',
      'remove_from_wishlist',
      'add_to_cart',
      'remove_from_cart',
      'product_view',
      'purchase',
    ];

    if (!event.action || !validateActions.includes(event.action)) {
      continue;
    }

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.error(`Error processing event: ${JSON.stringify(event)}`, error);
    }
  }
};

setInterval(processQueue, 3000);

export const consumerKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'users-event', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    },
  });
};

consumerKafkaMessages().catch((error) => {
  console.error('Error in Kafka consumer:', error);
  process.exit(1);
});
