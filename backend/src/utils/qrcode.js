const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

// The QR code does NOT just encode the ticket ID as plain text - anyone
// could guess/copy another ID. Instead it encodes a short-lived, signed
// JWT ("qrToken") containing the ticket ID. A conductor's scanner app
// calls verifyTicketToken() to confirm:
//   1. the signature is valid (wasn't forged or edited)
//   2. it hasn't expired
//   3. the ticket status in the DB is still "valid" (not already used)
// This is what stops a screenshotted/duplicated QR from being reused.

function generateTicketToken(ticketId, validUntil) {
  return jwt.sign(
    { ticketId, type: 'bus_pass_qr' },
    process.env.JWT_SECRET,
    { expiresIn: Math.floor((new Date(validUntil) - Date.now()) / 1000) }
  );
}

async function generateQrImage(token) {
  // Returns a base64 PNG data URL the frontend can render directly in an <img>.
  return QRCode.toDataURL(token, { errorCorrectionLevel: 'H', width: 300 });
}

function verifyTicketToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null; // invalid, tampered, or expired
  }
}

module.exports = { generateTicketToken, generateQrImage, verifyTicketToken };
