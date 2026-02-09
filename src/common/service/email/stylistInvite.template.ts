export const stylistInviteEmailTemplate = (inviteLink: string) => ({
  subject: 'Stylist Invitation – Complete Your Registration',

  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Stylist Invitation</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #1a1a1a;
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          color: #333333;
          line-height: 1.6;
        }
        .content h2 {
          color: #111111;
          font-size: 24px;
          margin-top: 0;
        }
        .button {
          display: block;
          width: 240px;
          margin: 30px auto;
          padding: 16px 24px;
          background-color: #ff6b6b;
          color: #ffffff;
          text-align: center;
          text-decoration: none;
          font-size: 18px;
          font-weight: bold;
          border-radius: 8px;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #ff5252;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #888888;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 20px 10px;
            border-radius: 8px;
          }
          .button {
            width: 100%;
            max-width: 300px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations!</h1>
        </div>
        <div class="content">
          <h2>Your stylist application has been approved</h2>
          <p>Dear Stylist,</p>
          <p>We are excited to inform you that your application has been successfully reviewed and approved.</p>
          <p>Please complete your registration by clicking the button below to set up your account and join our platform.</p>

          <a href="${inviteLink}" class="button" target="_blank">
            Complete Registration
          </a>

          <p><strong>Important:</strong> This invitation link will expire in <strong>24 hours</strong> for security reasons.</p>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #555555;">${inviteLink}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          <p>If you did not apply to become a stylist, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
});
