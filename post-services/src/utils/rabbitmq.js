import amqp from "amqplib";
import logger from "./logger.js";

let channel = null;
let connection = null;

const EXCHANGE_NAME = "social_events";

async function connectToRabbit() {
  const { RABBITMQ_URL } = process.env;

  if (!RABBITMQ_URL) {
    logger.warn("configuration error, Please setup rabbitMQ_URL");
  }

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to rabbitMQ");
    return channel;
  } catch (err) {
    logger.error(`Error connectiong to rabbitMq: ${err}`);
  }
}

async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectToRabbit();
  }

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message)),
  );
  logger.info(`Event Published: ${routingKey}`);
}

export { connectToRabbit, publishEvent };
