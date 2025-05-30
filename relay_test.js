const express = require('express');
const mqtt = require('mqtt');

const app = express();
app.use(express.json());

const port = process.env.PORT || 4000

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883', {
  clientId: 'webhook-relay-' + Math.random().toString(16).substr(2, 8),
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

app.post('/webhook', (req, res) => {
  const obj = req.body;
  if(obj.event == 'qr_code.credited'){
    mqttClient.publish('charger/evamp/mini/minitest04', obj.payload?.payment?.entity?.amount);
  }
  console.log('Webhook forwarded to MQTT:', obj.payload);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log('Relay server running on port 3000');
});
