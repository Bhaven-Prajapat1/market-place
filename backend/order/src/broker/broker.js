const amqp = require('amqplib');

let channel, connection;

async function connect() {
  if (connection) return connection;

  try {
    connection = await amqp.connect(process.env.RABBIT_URL);
    console.log("Connected to RabbitMQ");
    channel = await connection.createChannel();
  } catch (err) {
    console.error("Failed to connect to RabbitMQ:", err);
  }
}
async function publishToQueue(queueName, data = {}) {
  if (!channel || !connection) await connect();

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  console.log(`Message sent to queue ${queueName}:`, data);
  
}

async function subscribeToQueue(queueName, callback) {
  if (!channel || !connection) await connect();

  await channel.assertQueue(queueName, { durable: true });

  

}

module.exports = {
  connect,
  connection,
  channel,
  publishToQueue,
};
