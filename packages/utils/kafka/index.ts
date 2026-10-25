import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers: ['pkc-619z3.us-east1.gcp.confluent.cloud:9092'],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_API_KEY || '',
    password: process.env.KAFKA_API_SECRET || '',
  },
});

let producer: any = null;

export const sendKafkaEvent = async (topic: string, event: any) => {
  try {
    if (!producer) {
      producer = kafka.producer();
      await producer.connect();
    }
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(event) }],
    });
  } catch (error) {
    console.error('Failed to send Kafka event:', error);
  }
};
