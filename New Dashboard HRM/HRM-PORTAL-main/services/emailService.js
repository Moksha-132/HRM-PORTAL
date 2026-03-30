const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME || 'HRM Portal'} <${process.env.SMTP_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

const sendQueryResponseEmail = async (options) => {
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Query Response Updated</h1>
            </div>
            <div style="padding: 20px;">
                <p>Hello <strong>${options.userName || 'User'}</strong>,</p>
                <p>An administrator has responded to your recent query in the HRM Portal.</p>
                
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #4b5563;">Your Query:</p>
                    <p style="margin: 0; color: #374151;">${options.queryDetails || 'No query details provided.'}</p>
                    
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
                    
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #4f46e5;">Admin Response:</p>
                    <p style="margin: 0; color: #1f2937;">${options.responseMessage || 'No response message provided.'}</p>
                </div>

                <p>To view your full chat history or reply, please visit the portal:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5000/index.html#login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Portal</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    `;

    await sendEmail({
        email: options.to,
        subject: 'Update on Your HRM Query',
        html: html
    });
};

module.exports = { sendEmail, sendQueryResponseEmail };
