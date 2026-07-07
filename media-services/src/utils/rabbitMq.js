import { connect } from "amqplib";
import logger from "./logger.js";

let connection = null;
let channel = null;

const EXCHANGE_NAME = "social_events";

async function connectToRabbit() {
  try {
    const { RABBITMQ_URL } = process.env;

    if (!RABBITMQ_URL) {
      logger.warn("configuration error, Please setup rabbitMQ_URL");
    }

    connection = await connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to RabbitMQ");
    return channel;
  } catch (err) {
    logger.error(`Error connecting RabbitMq: ${err}`);
  }
}

async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectToRabbit();
  }

  if (!channel) {
    logger.warn("RabbitMQ channel is not available, event was not published.");
    return;
  }

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message)),
  );
  logger.info(`Event Published: ${routingKey}`);
}

async function subscribeEvent(routingKey, callBack) {
  if (!channel) {
    await connectToRabbit();
  }

  if (!channel) {
    logger.warn("RabbitMQ channel is not available, subscription skipped.");
    return;
  }

  const queue = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(queue.queue, EXCHANGE_NAME, routingKey);
  channel.consume(queue.queue, (message) => {
    if (message !== null) {
      try {
        const rawContent =
          message.content instanceof Buffer
            ? message.content.toString()
            : typeof message.content === "string"
              ? message.content
              : "";

        const content = JSON.parse(rawContent);
        callBack(content);
      } catch (error) {
        logger.error(
          `Error parsing RabbitMQ event for ${routingKey}: ${error.message}`,
        );
      } finally {
        channel.ack(message);
      }
    }
  });
  logger.info(`Subscribed to event: ${routingKey}`);
}

export { connectToRabbit, publishEvent, subscribeEvent };
