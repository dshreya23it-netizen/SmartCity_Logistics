const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password
  }
});

exports.sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const order = snapshot.data();
    
    const mailOptions = {
      from: 'Your Store <store@example.com>',
      to: order.customerInfo.email,
      subject: `Order Confirmation - ${order.orderId}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Order ID: ${order.orderId}</p>
        <p>Total: ₹${order.total}</p>
        <!-- Add more HTML content here -->
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent');
      return null;
    } catch (error) {
      console.error('Error sending email:', error);
      return null;
    }
  });