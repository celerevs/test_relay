const express = require('express');
const mqtt = require('mqtt');
// const Razorpay = require('razorpay');

// const razorpay = new Razorpay({
//   key_id: 'rzp_test_YOUR_KEY_ID',      // Replace with your Razorpay Key ID
//   key_secret: 'YOUR_KEY_SECRET'        // Replace with your Razorpay Key Secret
// });

const app = express();
app.use(express.json());



const port = process.env.PORT || 4000

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883', {
  clientId: 'webhook-relay-' + Math.random().toString(16).substr(2, 8),
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('refund/evamp/mini/', (err) => {
    if (err) {
      console.error('Subscribe error:', err);
    } else {
      console.log('Subscribed to topic');
    }
  });
});


app.post('/webhook', (req, res) => {
  const obj = req.body;
  var data = String(obj.payload?.payment?.entity?.amount);
  data += ",";
  data += String(obj.payload?.payment?.entity?.id);

  var topic = 'charger/evamp/mini/';
  topic += String(obj.payload?.qr_code?.entity?.id);
  if(obj.event == 'qr_code.credited'){
    mqttClient.publish(topic, data);
  }
  console.log('Webhook forwarded to MQTT:', obj.payload?.qr_code?.entity?.id);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log('Relay server running on port:', port);
});

// async function refundPayment(paymentId, amountInRupees = null) {
//   try {
//     const refundOptions = { payment_id: paymentId };

//     // If partial refund, convert to paise (1 INR = 100 paise)
//     if (amountInRupees !== null) {
//       refundOptions.amount = amountInRupees;
//     }

//     const refund = await razorpay.refunds.create(refundOptions);
//     console.log('Refund Successful:', refund);
//   } catch (error) {
//     console.error('Refund Failed:', error.error?.description || error.message);
//   }
// }

mqttClient.on('message', (topic, message) => {
  const [amount, payment_Id] = message.toString().split(',');
  console.log('Amount:', amount);         // ➤ "199"
  console.log('Payment ID:', payment_Id);
});
