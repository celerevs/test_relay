const express = require('express');
const mqtt = require('mqtt');

const app = express();
app.use(express.json());

const mqttClient = mqtt.connect('mqtt://YOUR_BROKER_IP:1883');

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

app.post('/webhook', (req, res) => {
  const payload = JSON.stringify(req.body);
  mqttClient.publish('esp32/trigger', payload);
  console.log('Webhook forwarded to MQTT:', payload);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Relay server running on port 3000');
});