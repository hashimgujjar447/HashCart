'use server';

import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'user-ui-producer',
  brokers: ['pkc-619z3.us-east1.gcp.confluent.cloud:9092'],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_API_KEY || '',
    password: process.env.KAFKA_API_SECRET || '',
  },
});

let producer: any = null;

export async function sendKafkaEvent(eventData: {
  userId?: string;
  productId?: string;
  shopId?: string;
  action: string;
  device?: string;
  country?: string;
  city?: string;
}) {
  try {
    if (!producer) {
      producer = kafka.producer();
      await producer.connect();
    }
    await producer.send({
      topic: 'users-event',
      messages: [
        {
          value: JSON.stringify(eventData),
        },
      ],
    });
  } catch (error) {
    console.error('Error sending Kafka event from server action:', error);
  }
}
