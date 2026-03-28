const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ email, subject, html, text }) => {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'HRM Portal';

    const mailOptions = {
        from: `${fromName} <${fromAddress}>`,
        to: email,
        subject,
        html,
        text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Email sent:', info.messageId);
    return info;
};

/**
 
 * @param {Object} data - Email data
 * @param {string} data.to - Recipient email
 * @param {string} data.userName - Name of the user 
 * @param {string} data.queryDetails - Original msg
 * @param {string} data.responseMessage - Updated msg
 * @returns {Promise<Object>} - Success or error
 */
const sendQueryResponseEmail = async ({ to, userName, queryDetails, responseMessage }) => {
    try {
        const mailOptions = {
            from: `"HR Portal Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject: `[HRM Support] Response Update - #${Date.now().toString().slice(-6)}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Support Query Updated</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>An administrator has responded to or updated your query. Below are the details:</p>
                        
                        <div style="background-color: #f9f9f9; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>Original Query:</strong></p>
                            <p style="margin: 0; font-style: italic;">"${queryDetails}"</p>
                        </div>
                        
                        <div style="background-color: #e7f3ff; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>Admin Response:</strong></p>
                            <p style="margin: 0;">${responseMessage}</p>
                        </div>
                        
                        <p>If you have further questions, please log in to the portal and visit the Support section.</p>
                        
                        <p style="margin-top: 30px;">Best regards,<br>The HR Portal Team</p>
                    </div>
                    <div style="background-color: #f1f1f1; color: #777; padding: 10px; text-align: center; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailService] Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EmailService] Failed to send email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail,
    sendQueryResponseEmail,
};
