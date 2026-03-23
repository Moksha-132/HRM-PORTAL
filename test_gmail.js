const nodemailer = require('nodemailer');
require('dotenv').config();

const testGmail = async () => {
    console.log('--- STARTING GMAIL CONNECTION TEST ---');
    console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
    console.log(`SMTP_FROM: ${process.env.SMTP_FROM}`);
    console.log(`Sending to: hrm.employee123@gmail.com`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"GMAIL TEST" <${process.env.SMTP_FROM}>`,
        to: 'hrm.employee123@gmail.com',
        subject: 'STRICT GMAIL TEST - ' + new Date().toLocaleString(),
        text: 'This is a DIRECT test message from the HR portal server to verify the Gmail connection.',
        html: '<b>THIS IS A DIRECT TEST MESSAGE</b><p>Sent at: ' + new Date().toLocaleString() + '</p>',
    };

    try {
        console.log('Attempting to send...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ SUCCESS! Email sent.');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        process.exit(0);
    } catch (err) {
        console.error('❌ FAILED to send email:');
        console.error(err);
        process.exit(1);
    }
};

testGmail();
