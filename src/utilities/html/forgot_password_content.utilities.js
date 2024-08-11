const forgotPasswordContent = (username, token, expiredToken) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          background-color: #ffffff;
          margin: 30px auto;
          padding: 20px;
          max-width: 600px;
          border-radius: 8px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background-color: #007bff;
          color: #ffffff;
          padding: 10px 0;
          border-radius: 8px 8px 0 0;
        }
        .content {
          margin: 20px 0;
          font-size: 16px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #888888;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>Reset Your Password</h2>
        </div>
        <div class="content">
          <p>Hi ${username},</p>
          <p>This is your token: <b>${token}</b></p>
          <p>Expired on: <b>${expiredToken}</b></p>
        </div>
      </div>
    </body>
    </html>
    `;
};

module.exports = forgotPasswordContent;