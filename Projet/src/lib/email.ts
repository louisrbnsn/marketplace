import crypto from 'crypto'

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateResetPasswordToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Generic email sending function
interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  console.log('📧 ===== SENDING EMAIL =====')
  console.log('To:', to)
  console.log('Subject:', subject)
  
  // If Resend is configured, use it
  if (process.env.RESEND_API_KEY) {
    try {
      // @ts-expect-error - Resend is optional and only loaded if configured
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      
      const result = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
      })
      
      console.log('✅ Email sent successfully via Resend:', result)
      return true
    } catch (error) {
      console.error('❌ Error sending email via Resend:', error)
      // Log the email for debugging
      console.log('Email content:', html)
      return false
    }
  } else {
    // Development mode without Resend - just log
    console.log('⚠️ RESEND_API_KEY not configured - email not sent')
    console.log('Content:', html)
    console.log('To configure: npm install resend and add RESEND_API_KEY in .env.local')
    console.log('==================')
    return false
  }
}

// For now, just log the email. In production, you would use a service like SendGrid, Resend, etc.
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">✨ Welcome!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Verify your email address</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #cbd5e1; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                      Thank you for signing up! Click the button below to verify your email address and activate your account.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                            Verify my email
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                      If the button doesn't work, copy and paste this link in your browser:
                    </p>
                    <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
                      ${verificationUrl}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 20px; text-align: center;">
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                      This link is valid for 24 hours.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
  
  try {
    await sendEmail({
      to: email,
      subject: '✨ Verify your email',
      html,
    })
    console.log('📧 Verification email sent to:', email)
    return verificationUrl
  } catch (error) {
    console.error('❌ Error sending verification email:', error)
    throw error
  }
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🔒 Forgot your password?</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">No problem, reset it</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #cbd5e1; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                      You requested to reset your password. Click the button below to set a new password.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                            Reset my password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                      If the button doesn't work, copy and paste this link in your browser:
                    </p>
                    <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
                      ${resetUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #334155; margin: 30px 0;">
                    
                    <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 0;">
                      ⚠️ If you didn't request this reset, ignore this email. Your password will not be changed.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 20px; text-align: center;">
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                      This link is valid for 1 hour.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
  
  try {
    await sendEmail({
      to: email,
      subject: '🔒 Reset your password',
      html,
    })
    console.log('📧 Password reset email sent to:', email)
    return resetUrl
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw error
  }
}
