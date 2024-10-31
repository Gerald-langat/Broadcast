// pages/api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, name, organization, phone, selectedCategory } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.USER,
      subject: `Email from ${name || 'Anonymous'} via Broadcast`,
      text: `You have a new message from ${name || 'Anonymous'}:
      
      Organization: ${organization || 'N/A'}
      Phone: ${phone || 'N/A'}
      Category: ${selectedCategory || 'N/A'}
      Email: ${email}

      Regards,
      ${name || 'Anonymous'}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
