import { connect } from "amqplib";

import logger from "./logger.js";

let connection = null;
let channel = null;

const EXCHANGE_NAME = "social_events";

async function connectToRabbit() {
  const { RABBITMQ_URL } = process.env;

  if (!RABBITMQ_URL) {
    logger.warn("RabbitMq configuration failure @ Search-service");
  }

  try {
    connection = await connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to RabbitMq");
    return channel;
  } catch (err) {
    logger.error(`Error connecting to RabbitMq: ${err}`);
  }
}

async function subscribeEvent(routingKey, callback) {
  if (!channel) {
    await connectToRabbit();
  }

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });

  logger.info(`Subscribed to event: ${routingKey}`);
}

export { connectToRabbit, subscribeEvent };
