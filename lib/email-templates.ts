
export const getOtpEmailHtml = (otp: string, siteName: string, type: 'verification' | 'login') => {
    const title = type === 'login' ? 'Login Verification' : 'Verify Your Email';
    const message = type === 'login'
        ? 'A login attempt was made for your account.'
        : 'Please verify your email address to continue.';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: #1f2937; padding: 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 40px 32px; text-align: center; }
        .icon { background: #eff6ff; color: #3b82f6; width: 64px; height: 64px; text-align: center; line-height: 64px; border-radius: 50%; border: 1px solid #dbeafe; margin: 0 auto 24px; font-size: 28px; }
        .otp-box { background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 32px 0; border: 1px dashed #d1d5db; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #1f2937; letter-spacing: 8px; margin: 0; }
        .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #6b7280; font-size: 13px; margin: 0; }
        .text-muted { color: #6b7280; line-height: 1.5; margin-bottom: 0; }
        .warning { color: #ef4444; font-size: 13px; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${siteName}</h1>
        </div>
        <div class="content">
            <div class="icon">🔒</div>
            <h2 style="color: #111827; margin: 0 0 12px; font-size: 22px;">${title}</h2>
            <p class="text-muted">${message} Use the code below to complete the process.</p>
            
            <div class="otp-box">
                <p class="otp-code">${otp}</p>
            </div>

            <p style="color: #4b5563; font-size: 14px;">This code will expire in 10 minutes.</p>
            <p class="warning">If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};
