const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: (process.env.MAIL_PASSWORD || '').replace(/\s+/g, '')
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Mail Service Error:', error);
    } else {
        console.log('Mail Service is ready to send notifications');
    }
});

/**
 * Send an email notification for a new leave application
 * @param {Object} details { employeeName, leaveType, startDate, endDate, managerEmail }
 */
const sendLeaveNotification = async (details) => {
    const { employeeName, leaveType, startDate, endDate, managerEmail } = details;

    const mailOptions = {
        from: process.env.SMTP_FROM || `"HRM Portal" <${process.env.SMTP_USER}>`,
        to: managerEmail || 'lmoksha.132@gmail.com', // Fallback to requested address
        subject: `New Leave Application: ${employeeName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
                <h2 style="color: #6366f1; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">New Leave Request Received</h2>
                <p>Hello Manager,</p>
                <p><strong>${employeeName}</strong> has just submitted a new leave application. Here are the details:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Leave Type:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${leaveType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Start Date:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${startDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>End Date:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${endDate}</td>
                    </tr>
                </table>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 0.9rem; color: #475569;">
                    Please log in to the HRM Portal to review and approve/reject this application.
                </div>
                
                <p style="margin-top: 30px; font-size: 0.8rem; color: #94a3b8; text-align: center;">
                    This is an automated notification from your HRM Portal.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Leave Notification Email Sent: ', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send leave email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendLeaveNotification
};
