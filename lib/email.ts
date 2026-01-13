import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Coinspulse <noreply@coinspulsehq.com>';
const SUPPORT_EMAIL = 'support@coinspulsehq.com';

// --- Shared Styles & Template Wrapper ---
const emailStyles = {
  container: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;',
  header: 'text-align: center; border-bottom: 2px solid #f0f0f0; padding: 20px 0; margin-bottom: 24px;',
  logo: 'font-size: 24px; font-weight: bold; color: #1a1a1a; text-decoration: none; display: inline-block;',
  heading: 'color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 16px;',
  text: 'color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 16px;',
  codeBox: 'background-color: #f4f4f5; border: 1px solid #d4d4d8; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0;',
  code: 'font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;',
  buttonContainer: 'text-align: center; margin: 32px 0;',
  button: 'background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;',
  footer: 'margin-top: 32px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center; font-size: 12px; color: #888888;',
  table: 'width: 100%; border-collapse: collapse; margin: 16px 0;',
  tdLabel: 'padding: 8px 0; color: #666666; font-size: 14px;',
  tdValue: 'padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 600; font-size: 14px;',
  alert: 'background-color: #fff8f6; border-left: 4px solid #ff4444; padding: 12px; font-size: 14px; color: #c53030; margin: 16px 0;'
};

const EmailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f9fafb;">
  <div style="${emailStyles.container}">
    <div style="${emailStyles.header}">
       <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.coinspulsehq.com'}" style="${emailStyles.logo}">
         <span style="display: block; letter-spacing: 1px;">COINSPULSE</span>
       </a>
    </div>
    ${content}
    <div style="${emailStyles.footer}">
      <p style="margin: 4px 0;">This is an automated message from the Coinspulse Mining Network.</p>
      <p style="margin: 4px 0;">&copy; ${new Date().getFullYear()} Coinspulse. All rights reserved.</p>
      <p style="margin: 4px 0;">
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #666; text-decoration: underline;">Contact System Administrator</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// --- Email Functions ---

interface SendEmailResult {
  success: boolean;
  data?: any;
  error?: any;
}

// 1. Signup Verification (OTP)
export async function sendSignupOTP(email: string, code: string): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Verify Your Email</h2>
    <p style="${emailStyles.text}">Welcome to Coinspulse! We're excited to have you on board.</p>
    <p style="${emailStyles.text}">Please use the verification code below to complete your registration:</p>
    <div style="${emailStyles.codeBox}">
      <span style="${emailStyles.code}">${code}</span>
    </div>
    <p style="${emailStyles.text}">This code will expire in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email address - Coinspulse',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Signup Email Error:", error);
    return { success: false, error };
  }
}

// 2. Login Verification (OTP)
export async function sendLoginOTP(email: string, code: string): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Login Verification</h2>
    <p style="${emailStyles.text}">A login attempt was made to your account. For your security, please use the One-Time Password (OTP) below to proceed:</p>
    <div style="${emailStyles.codeBox}">
      <span style="${emailStyles.code}">${code}</span>
    </div>
    <div style="${emailStyles.alert}">
      <strong>Security Notice:</strong> If you did not attempt to sign in, please contact support immediately and change your password.
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Login Verification Code - Coinspulse',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Login Email Error:", error);
    return { success: false, error };
  }
}

// 3. Welcome Email (Post-Verification)
export async function sendWelcomeEmail(email: string, name: string): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Welcome to the Network, ${name}! 👋</h2>
    <p style="${emailStyles.text}">Your account has been successfully verified and your access to the Coinspulse infrastructure is now active.</p>
    <p style="${emailStyles.text}">You can now deploy high-performance mining rigs and participate in our global reward distribution clusters.</p>
    <div style="${emailStyles.buttonContainer}">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.coinspulsehq.com'}/dashboard" style="${emailStyles.button}">Go to Dashboard</a>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Coinspulse! 🚀',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Welcome Email Error:", error);
    return { success: false, error };
  }
}

// 4. Withdrawal Verification (OTP) - Detailed
export async function sendWithdrawalOTP(
    email: string, 
    code: string, 
    details: { amount: number; asset: string; network: string; address: string }
): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Confirm Withdrawal Request</h2>
    <p style="${emailStyles.text}">You have requested a withdrawal. Please verify the transaction details below before confirming:</p>
    
    <table style="${emailStyles.table}">
      <tr>
        <td style="${emailStyles.tdLabel}">Amount</td>
        <td style="${emailStyles.tdValue}">$${details.amount?.toLocaleString()} USD</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Asset</td>
        <td style="${emailStyles.tdValue}">${details.asset || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Network</td>
        <td style="${emailStyles.tdValue}">${details.network || 'N/A'}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Destination</td>
        <td style="${emailStyles.tdValue}"><span style="font-family: monospace;">${details.address}</span></td>
      </tr>
    </table>

    <p style="${emailStyles.text}">To authorize this transaction, enter the code below:</p>

    <div style="${emailStyles.codeBox}">
      <span style="${emailStyles.code}">${code}</span>
    </div>
    
    <div style="${emailStyles.alert}">
      <strong>Warning:</strong> If you did not initiate this withdrawal, do not share this code. secure your account immediately.
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Confirm Your Withdrawal - Coinspulse',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Withdrawal OTP Error:", error);
    return { success: false, error };
  }
}

// 5. Deposit Confirmation
export async function sendDepositConfirmation(
    email: string, 
    amount: number, 
    details: { txHash: string; asset: string; network: string }
): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Deposit Confirmed ✅</h2>
    <p style="${emailStyles.text}">Your deposit has been successfully processed and credited to your account balance.</p>
    
    <table style="${emailStyles.table}">
      <tr>
        <td style="${emailStyles.tdLabel}">Amount Credited</td>
        <td style="${emailStyles.tdValue}">$${amount.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Asset</td>
        <td style="${emailStyles.tdValue}">${details.asset}</td>
      </tr>
       <tr>
        <td style="${emailStyles.tdLabel}">Network</td>
        <td style="${emailStyles.tdValue}">${details.network}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Transaction ID</td>
        <td style="${emailStyles.tdValue}"><span style="font-family: monospace; font-size: 12px;">${details.txHash}</span></td>
      </tr>
    </table>

    <div style="${emailStyles.buttonContainer}">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.coinspulsehq.com'}/dashboard" style="${emailStyles.button}">View Balance</a>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Deposit Received - Coinspulse',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Deposit Confirmation Error:", error);
    return { success: false, error };
  }
}

// 6. Withdrawal Success Confirmation
export async function sendWithdrawalConfirmation(
    email: string, 
    amount: number, 
    details: { txHash: string; asset: string; network: string; address: string }
): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Withdrawal Processed 💸</h2>
    <p style="${emailStyles.text}">Your withdrawal has been successfully processed and sent to your external wallet.</p>
    
    <table style="${emailStyles.table}">
      <tr>
        <td style="${emailStyles.tdLabel}">Amount Sent</td>
        <td style="${emailStyles.tdValue}">$${amount.toLocaleString()}</td>
      </tr>
       <tr>
        <td style="${emailStyles.tdLabel}">Asset</td>
        <td style="${emailStyles.tdValue}">${details.asset}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Network</td>
        <td style="${emailStyles.tdValue}">${details.network}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Destination</td>
        <td style="${emailStyles.tdValue}"><span style="font-family: monospace; font-size: 12px;">${details.address}</span></td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Transaction ID</td>
        <td style="${emailStyles.tdValue}"><span style="font-family: monospace; font-size: 12px;">${details.txHash}</span></td>
      </tr>
    </table>
    
     <p style="${emailStyles.text}">Please check your external wallet for the funds. Blockchain confirmations may take a few minutes.</p>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Withdrawal Successful - Coinspulse',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Withdrawal Confirmation Error:", error);
    return { success: false, error };
  }
}

// 7. Investment Confirmation (NEW)
// 8. Deposit Rejection
export async function sendDepositRejection(
    email: string, 
    amount: number, 
    details: { asset: string; network: string; reason?: string; txHash?: string }
): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Deposit Not Processed</h2>
    <p style="${emailStyles.text}">We were unable to process your recent deposit request. Our team has reviewed the transaction and identified an issue.</p>
    
    <table style="${emailStyles.table}">
      <tr>
        <td style="${emailStyles.tdLabel}">Amount</td>
        <td style="${emailStyles.tdValue}">$${amount.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Asset</td>
        <td style="${emailStyles.tdValue}">${details.asset}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Network</td>
        <td style="${emailStyles.tdValue}">${details.network}</td>
      </tr>
      ${details.txHash ? `
      <tr>
        <td style="${emailStyles.tdLabel}">Ref ID</td>
        <td style="${emailStyles.tdValue}"><span style="font-family: monospace; font-size: 12px;">${details.txHash}</span></td>
      </tr>
      ` : ''}
      ${details.reason ? `
      <tr>
        <td style="${emailStyles.tdLabel}">Reason</td>
        <td style="${emailStyles.tdValue}">${details.reason}</td>
      </tr>
      ` : ''}
    </table>

    <div style="${emailStyles.alert}">
      <strong>Action Required:</strong> If you believe this was processed in error or need assistance, please contact our support team.
    </div>

    <div style="${emailStyles.buttonContainer}">
      <a href="mailto:${SUPPORT_EMAIL}" style="${emailStyles.button}">Contact Support</a>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Deposit Request Update - Coinspulse',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Deposit Rejection Error:", error);
    return { success: false, error };
  }
}

// 9. Withdrawal Rejection
export async function sendWithdrawalRejection(
    email: string, 
    amount: number, 
    details: { asset: string; network: string; reason?: string; txHash?: string }
): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Withdrawal Request Declined</h2>
    <p style="${emailStyles.text}">Your recent withdrawal request could not be completed. Our security team has reviewed your request and identified an issue that requires attention.</p>
    
    <table style="${emailStyles.table}">
      <tr>
        <td style="${emailStyles.tdLabel}">Amount</td>
        <td style="${emailStyles.tdValue}">$${amount.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Asset</td>
        <td style="${emailStyles.tdValue}">${details.asset}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Network</td>
        <td style="${emailStyles.tdValue}">${details.network}</td>
      </tr>
      ${details.txHash ? `
      <tr>
        <td style="${emailStyles.tdLabel}">Ref ID</td>
        <td style="${emailStyles.tdValue}"><span style="font-family: monospace; font-size: 12px;">${details.txHash}</span></td>
      </tr>
      ` : ''}
      ${details.reason ? `
      <tr>
        <td style="${emailStyles.tdLabel}">Reason</td>
        <td style="${emailStyles.tdValue}">${details.reason}</td>
      </tr>
      ` : ''}
    </table>

    <p style="${emailStyles.text}">Your funds remain secure in your account. If you have questions or need clarification, our support team is here to help.</p>

    <div style="${emailStyles.buttonContainer}">
      <a href="mailto:${SUPPORT_EMAIL}" style="${emailStyles.button}">Contact Support</a>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Withdrawal Request Update - Coinspulse',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Withdrawal Rejection Error:", error);
    return { success: false, error };
  }
}

// 10. Mining Contract Confirmation
export async function sendInvestmentConfirmation(
    email: string, 
    details: { planName: string; amount: number; dailyROI: number; endDate: Date }
): Promise<SendEmailResult> {
    
  const content = `
    <h2 style="${emailStyles.heading}">Mining Contract Activated ⚡</h2>
    <p style="${emailStyles.text}">Your high-performance hashing contract has been successfully initialized. Our hardware clusters have begun allocating computational resources to your dedicated mining rig.</p>
    
    <table style="${emailStyles.table}">
      <tr>
        <td style="${emailStyles.tdLabel}">Hardware Cluster</td>
        <td style="${emailStyles.tdValue}">${details.planName}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Lease Capacity</td>
        <td style="${emailStyles.tdValue}">$${details.amount.toLocaleString()} Capacity</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Est. Daily Output</td>
        <td style="${emailStyles.tdValue}">${(details.dailyROI * 100).toFixed(2)}% ROI</td>
      </tr>
       <tr>
        <td style="${emailStyles.tdLabel}">Deployment Tier</td>
        <td style="${emailStyles.tdValue}">12 Month Priority</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Rig Maturity</td>
        <td style="${emailStyles.tdValue}">${details.endDate.toLocaleDateString()}</td>
      </tr>
    </table>

    <p style="${emailStyles.text}">You can monitor real-time hash rates, energy efficiency, and accrued outputs directly from your dashboard.</p>

    <div style="${emailStyles.buttonContainer}">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.coinspulsehq.com'}/dashboard/invest" style="${emailStyles.button}">Monitor Rig Performance</a>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Mining Deployment Confirmation - Coinspulse',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Mining Confirmation Error:", error);
    return { success: false, error };
  }
}

// 11. Contact Form Submission
export async function sendContactFormEmail(
    email: string, 
    name: string,
    message: string
): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">New Contact Inquiry</h2>
    <p style="${emailStyles.text}">You have received a new message from the contact form.</p>
    
    <table style="${emailStyles.table}">
      <tr>
        <td style="${emailStyles.tdLabel}">From</td>
        <td style="${emailStyles.tdValue}">${name}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Email</td>
        <td style="${emailStyles.tdValue}">${email}</td>
      </tr>
      <tr>
        <td style="${emailStyles.tdLabel}">Message</td>
        <td style="${emailStyles.tdValue}">${message}</td>
      </tr>
    </table>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `New Inquiry from ${name} - Coinspulse`,
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Contact Form Email Error:", error);
    return { success: false, error };
  }
}

// 12. Password Reset Email
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<SendEmailResult> {
  const content = `
    <h2 style="${emailStyles.heading}">Reset Your Password 🔒</h2>
    <p style="${emailStyles.text}">We received a request to reset the password for your Coinspulse account.</p>
    <p style="${emailStyles.text}">Click the button below to secure your account and set a new password:</p>
    
    <div style="${emailStyles.buttonContainer}">
      <a href="${resetLink}" style="${emailStyles.button}">Reset Password</a>
    </div>

    <p style="${emailStyles.text}">This link is valid for 15 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
    
    <div style="${emailStyles.alert}">
      <strong>Security Tip:</strong> Never share this link with anyone. Coinspulse support will never ask for your password.
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your Coinspulse password',
      html: EmailWrapper(content),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Password Reset Email Error:", error);
    return { success: false, error };
  }
}
