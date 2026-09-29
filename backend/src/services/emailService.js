const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function deliveryError(error) {
  const message = error?.message || 'Email delivery failed';
  if (/testing emails|verify a domain|not verified/i.test(message)) {
    return 'Email sending is not configured for this domain. Verify the sender domain in Resend and set EMAIL_FROM to an address on that domain.';
  }
  return message;
}

async function sendVerificationEmail({ email, firstName, token, frontendUrl }) {
  if (!frontendUrl) throw new Error('A frontend URL is required to create an email verification link');
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
  console.log(`[Email Service] Verification link for ${email}: ${verifyUrl}`);

  try {
    const toRecipient = email;
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: toRecipient,
      subject: 'Verify your nook account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your nook account</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f0e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #17231e;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f0e8; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border: 1px solid rgba(23, 35, 30, 0.12); padding: 40px 36px; border-radius: 4px; box-shadow: 0 4px 20px rgba(23,35,30,0.06);">
                  <tr>
                    <td style="padding-bottom: 28px;">
                      <span style="background-color: #eb6950; color: #ffffff; font-family: Georgia, serif; font-style: italic; font-size: 20px; font-weight: bold; width: 30px; height: 30px; line-height: 30px; display: inline-block; text-align: center; transform: rotate(-8deg); margin-right: 8px;">n</span>
                      <span style="font-size: 22px; font-weight: 800; letter-spacing: -1px; color: #17231e;">nook<span style="color: #eb6950;">.</span></span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="font-family: monospace; font-size: 10px; letter-spacing: 1.5px; color: #eb6950; text-transform: uppercase; margin: 0 0 10px 0;">EMAIL VERIFICATION</p>
                      <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #17231e; margin: 0 0 16px 0;">Welcome, ${firstName || 'there'}!</h1>
                      <p style="font-size: 14px; line-height: 1.65; color: rgba(23,35,30,0.7); margin: 0 0 28px 0;">
                        Thank you for joining nook. Please confirm your email address so you can access your dashboard and reserve inspiring workspaces.
                      </p>
                      <div style="margin: 32px 0;">
                        <a href="${verifyUrl}" target="_blank" style="background-color: #17231e; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; padding: 14px 28px; display: inline-block; text-transform: uppercase; border-radius: 2px;">
                          Verify Email Address &rarr;
                        </a>
                      </div>
                      <p style="font-size: 12px; line-height: 1.6; color: rgba(23,35,30,0.5); margin: 24px 0 8px 0;">
                        If the button above does not work, copy and paste this link into your browser:
                      </p>
                      <p style="font-size: 12px; margin: 0 0 28px 0;">
                        <a href="${verifyUrl}" style="color: #eb6950; word-break: break-all;">${verifyUrl}</a>
                      </p>
                      <hr style="border: 0; border-top: 1px solid rgba(23, 35, 30, 0.1); margin: 28px 0 20px 0;" />
                      <p style="font-size: 11px; color: rgba(23,35,30,0.45); margin: 0;">
                        If you did not create a nook account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      const message = deliveryError(error);
      console.warn('[Resend Service Warning]:', message);
      return { data: null, error: { message }, verifyUrl };
    }

    console.log('[Resend Service] Verification email dispatched:', data?.id);
    return { data, error: null, verifyUrl };
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error.message || error);
    // Return verifyUrl for development resilience
    return { data: null, error: { message: deliveryError(error) }, verifyUrl };
  }
}

module.exports = { sendVerificationEmail };
