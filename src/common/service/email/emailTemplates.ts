export const otpEmailTemplate = (otp: string) => ({
  subject: 'Your OTP Verification Code',
  html: `
  <div style="
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    font-family: Arial, Helvetica, sans-serif;
  ">
    <!-- Header -->
    <div style="
      background: #4f46e5;
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    ">
      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Verify Your Identity</h1>
      <p style="margin: 12px 0 0; font-size: 16px; opacity: 0.9;">
        Use the code below to complete your verification
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px; text-align: center;">
      <p style="font-size: 18px; color: #333333; margin: 0 0 32px;">
        Your one-time verification code:
      </p>

      <!-- OTP Display -->
      <div style="
        display: inline-block;
        background: #f8f9fa;
        border: 2px dashed #4f46e5;
        border-radius: 12px;
        padding: 24px 32px;
        margin: 20px 0;
      ">
        <h2 style="
          margin: 0;
          font-size: 48px;
          font-weight: bold;
          letter-spacing: 14px;
          color: #4f46e5;
        ">
          ${otp}
        </h2>
      </div>

      <p style="font-size: 16px; color: #666666; margin: 32px 0 0;">
        This code expires in <strong>5 minutes</strong>.
      </p>
      <p style="font-size: 14px; color: #999999; margin: 20px 0 0;">
        Didn't request this? You can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #999999;
    ">
      <p style="margin: 0 0 8px;">© 2025 Your App Name. All rights reserved.</p>
      <p style="margin: 0;">Questions? Reach us at support@yourapp.com</p>
    </div>
  </div>
`,
});
