const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAuthorityEmail = async (report, user) => {
  const severityColor = {
    low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444'
  };
  const color = severityColor[report.severity] || '#6366f1';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
  .card { background: white; border-radius: 12px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 30px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .header p { color: rgba(255,255,255,0.8); margin: 5px 0 0; }
  .badge { display: inline-block; background: ${color}; color: white; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin: 10px 0; }
  .body { padding: 30px; }
  .field { margin-bottom: 16px; border-left: 3px solid ${color}; padding-left: 12px; }
  .field label { font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600; letter-spacing: 0.5px; }
  .field p { margin: 4px 0 0; font-size: 15px; color: #1f2937; font-weight: 500; }
  .image-section { padding: 0 30px 20px; }
  .image-section img { width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; }
  .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  .ticket-id { font-family: monospace; background: #dbeafe; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; font-weight: 700; }
</style></head>
<body>
<div class="card">
  <div class="header">
    <h1>🚧 Road Damage Report</h1>
    <p>New damage reported via RoadCare App</p>
    <div class="badge">${report.severity.toUpperCase()} SEVERITY</div>
  </div>
  <div class="body">
    <div class="field"><label>Ticket ID</label><p><span class="ticket-id">${report.ticketId}</span></p></div>
    <div class="field"><label>Damage Type</label><p>${report.damageType.replace('_', ' ').toUpperCase()}</p></div>
    <div class="field"><label>Title</label><p>${report.title}</p></div>
    <div class="field"><label>Description</label><p>${report.description}</p></div>
    <div class="field"><label>Location</label><p>${report.location.address || 'N/A'}<br><small style="color:#6b7280">Lat: ${report.location.lat}, Lng: ${report.location.lng}</small></p></div>
    <div class="field"><label>Reported By</label><p>${user.name} (${user.email}) | ${user.mobile}</p></div>
    <div class="field"><label>Reported On</label><p>${new Date(report.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p></div>
    <div class="field"><label>AI Analysis</label><p>${report.aiAnalysis?.reasoning || 'Verified by AI'}</p></div>
  </div>
  <div class="image-section">
    <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;font-weight:600;margin-bottom:8px;">📸 Damage Photo</p>
    <img src="${report.imageUrl}" alt="Road Damage" />
  </div>
  <div class="footer">
    Please take immediate action based on the severity level.<br>
    <strong>RoadCare App</strong> — Citizen Road Damage Reporting System
  </div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"RoadCare App" <${process.env.EMAIL_USER}>`,
    to: process.env.AUTHORITY_EMAIL,
    subject: `[${report.severity.toUpperCase()}] Road Damage Report - ${report.ticketId} | ${report.location.city || report.location.address}`,
    html,
  });
};

const sendUserConfirmation = async (report, user) => {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
  .card { background: white; border-radius: 12px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #065f46, #10b981); padding: 30px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .body { padding: 30px; }
  .ticket { background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px; }
  .ticket p { margin: 0; color: #065f46; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
  .ticket h2 { margin: 8px 0 0; font-family: monospace; font-size: 28px; color: #047857; }
  .points { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; border-radius: 8px; padding: 16px; text-align: center; }
  .points h3 { margin: 0; font-size: 22px; }
  .points p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
</style></head>
<body>
<div class="card">
  <div class="header">
    <h1>✅ Report Submitted!</h1>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Thank you for being a responsible citizen, ${user.name}!</p>
  </div>
  <div class="body">
    <div class="ticket">
      <p>Your Ticket ID</p>
      <h2>${report.ticketId}</h2>
    </div>
    <p style="color:#374151">Your road damage report has been successfully submitted and forwarded to the municipal authorities. You can track the status of your report in the RoadCare app.</p>
    <div class="points">
      <h3>+${report.pointsAwarded} Points Earned! 🎉</h3>
      <p>Keep reporting to earn more badges and make roads safer!</p>
    </div>
  </div>
  <div class="footer">RoadCare App — Making roads safer, one report at a time.</div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"RoadCare App" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `✅ Report Confirmed - ${report.ticketId} | RoadCare`,
    html,
  });
};

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"RoadCare App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP - RoadCare',
    html: `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:30px;border-radius:12px;background:#1e3a5f;color:white;text-align:center">
      <h2>🔐 Password Reset</h2>
      <p>Your OTP is:</p>
      <div style="font-size:40px;font-weight:900;letter-spacing:10px;background:rgba(255,255,255,0.1);padding:20px;border-radius:8px;margin:20px 0">${otp}</div>
      <p style="opacity:0.7;font-size:13px">Valid for 10 minutes. Don't share this with anyone.</p>
    </div>`,
  });
};

module.exports = { sendAuthorityEmail, sendUserConfirmation, sendOTPEmail };
