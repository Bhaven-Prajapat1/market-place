const { subscribeToQueue } = require("./broker");
const sendEmail = require("../email");

module.exports = function () {
  subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED", async (data) => {
    console.log("Received message:", data);

    const emailHTMLTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
        <div class="header">
          <h1>Welcome to Our Service! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi ${data.fullName.firstName} ${data.fullName.lastName},</p>
          <p>Thank you for signing up. We're excited to have you on board!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Our Service. All rights reserved.</p>
        </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      data.email,
      "Welcome to Our Service",
      "",
      emailHTMLTemplate,
    );
  });

  subscribeToQueue(
    "PAYMENT_NOTIFICATION.PAYMENT_COMPLETED",
    async (paymentData) => {
      const emailHTMLTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container"></div>
            <div class="header">
              <h1>Payment Successful! 💳</h1>
            </div>
            <div class="content">
              <p>Hi ${paymentData.fullName.firstName} ${paymentData.fullName.lastName},</p>
              <p>Your payment of ${paymentData.currency} ${paymentData.amount.toFixed(2)} has been processed successfully.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Our Service. All rights reserved.</p>
            </div>
          </body>
          </html>
        `;

      await sendEmail(
        paymentData.email,
        "Payment Successful",
        "",
        emailHTMLTemplate,
      );
    },
  );

  subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", async (data) => {
    console.log("Received message:", data);
    const emailHTMLTemplate = `
      <!DOCTYPE html>
      <html></html>
      <head>
        <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"></div>
            <h1>Payment Initiated! ⏳</h1>
          </div>
          <div class="content"></div>
            <p>Hi ${data.fullName},</p>
            <p>Your payment of ${data.amount.toFixed(2)} ${data.currency} for order id: ${data.orderId} has been initiated. We will notify you once the payment is completed.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(data.email, "Payment Initiated", "", emailHTMLTemplate);
  });

  subscribeToQueue(
    "PAYMENT_NOTIFICATION.PAYMENT_FAILED",
    async (paymentData) => {
      const emailHTMLTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container"></div>
            <div class="header">
              <h1>Payment Failed! ❌</h1>
            </div>
            <div class="content">
              <p>Hi ${paymentData.fullName.firstName} ${paymentData.fullName.lastName},</p>
              <p>Unfortunately, your payment for order id: ${paymentData.orderId} could not be processed. Please try again or contact support for assistance.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Our Service. All rights reserved.</p>
            </div>
          </body>
          </html>
      `;

      await sendEmail(
        paymentData.email,
        "Payment Failed",
        "",
        emailHTMLTemplate,
      );
    },
  );

  subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
    const emailHTMLTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body></body>
        <div class="container">
          <div class="header">
            <h1>Product Created!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.username},</p>
            <p>Congratulations! Your product ${data.productName} has been created successfully.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Our Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(data.email, "Product Created", "", emailHTMLTemplate);
  });
};
