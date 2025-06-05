const axios = require('axios');
const qs = require('qs');  // To encode form data

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
  clean:true,
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('refund/evamp/mini', (err) => {
    if (err) {
      console.error('Subscribe error:', err);
    } else {
      console.log('Subscribed to topic');
    }
  });
});

// Replace with your actual values
const API_KEY = 'gvuxjvr9jbuavfopzzxsazazsrdeks76';
const SOURCE_NUMBER = '917834811114'; // Gupshup sandbox sender number
var DESTINATION_NUMBER = '919979646220'; // Recipient number (must be opted-in)
const APP_NAME = 'TestUPI'; // Exact app name from Gupshup

// Message content
var messageW = {
  type: 'text',
  text: 'Hello from Gupshup Sandbox API using Node.js!'
};

var messageX = {
  type: 'text',
  text: 'Hello from Gupshup Sandbox API using Node.js!'
};

// Form-encoded body


// Send message




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
  
  messageX.text = 'Hello 👋 \n\nWe have received your payment for a charging session at Mobilane station. \n\nThe transaction details are shown below. \n\n*Received amount: ₹ '+ String((obj.payload?.payment?.entity?.amount)/100) + '*\n*Sanctioned energy: '+ ((obj.payload?.payment?.entity?.amount)/1938).toFixed(2) + ' kWH* \n\nWhile your vehicle is getting charged please sit back and relax. Come back soon because, \n*Its Just FAST!*⚡';

  var data = qs.stringify({
  channel: 'whatsapp',
  source: SOURCE_NUMBER,
  destination: DESTINATION_NUMBER,
  'src.name': APP_NAME,
  message: JSON.stringify(messageX)
});

// Axios config
var config = {
  method: 'post',
  url: 'https://api.gupshup.io/sm/api/v1/msg',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'apikey': API_KEY
  },
  data: data
};

  axios(config)
  .then(response => {
    console.log('Message sent successfully:', response.data);
  })
  .catch(error => {
    console.error('Failed to send message:', error.response?.data || error.message);
  });
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

  messageW.text = 'Your charging session at Mobilane station is finished. \n\nThe reason for ending the transaction is user initiation.\n\nRefund of *₹ '+ (amount/100).toFixed(2) +'* has been generated and will be processed within 3 days.  \n\nThank you for trusting Mobilane, \nRegards Team EVamp ';

  var data = qs.stringify({
  channel: 'whatsapp',
  source: SOURCE_NUMBER,
  destination: DESTINATION_NUMBER,
  'src.name': APP_NAME,
  message: JSON.stringify(messageW)
});

// Axios config
var config = {
  method: 'post',
  url: 'https://api.gupshup.io/sm/api/v1/msg',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'apikey': API_KEY
  },
  data: data
};

  axios(config)
  .then(response => {
    console.log('Message sent successfully:', response.data);
  })
  .catch(error => {
    console.error('Failed to send message:', error.response?.data || error.message);
  });
});

