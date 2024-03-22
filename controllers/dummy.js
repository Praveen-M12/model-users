// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate a random token
const generateToken = async () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString('hex'));
    });
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  // Configure nodemailer to send emails (replace with your email configuration)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_password'
    }
  });

  // Send email with password reset link
  const mailOptions = {
    from: 'your_email@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `To reset your password, click on this link: http://localhost:3000/reset-password/${token}`
  };

  await transporter.sendMail(mailOptions);
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a unique token
    const token = await generateToken();

    // Store the token and its expiration time in the user's record in the database
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(email, token);

    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by reset password token and check if it's still valid
    const user = await User.findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Token expiration check
      } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Password reset token is invalid or has expired' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Salt rounds: 10

    // Update password with the hashed new password
    user.password = hashedNewPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
