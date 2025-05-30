const express = require('express');
const mqtt = require('mqtt');

const app = express();
app.use(express.json());

const port = process.env.PORT || 4000

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883', {
  protocol: 'wss',
  reconnectPeriod: 1000,
  clientId: 'webhook-relay-' + Math.random().toString(16).substr(2, 8),
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

app.post('/webhook', (req, res) => {
  const payload = JSON.stringify(req.body);
  mqttClient.publish('esp32/trigger/upi', payload);
  console.log('Webhook forwarded to MQTT:', payload);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log('Relay server running on port 3000');
});
