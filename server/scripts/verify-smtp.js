import nodemailer from 'nodemailer';
import { loadConfig } from '../src/config.js';

const config = loadConfig();
const rawPass = (process.env.SMTP_PASS || '').trim();
const cleanPass = rawPass.replace(/\s+/g, '');

console.log('--- Gmail SMTP Diagnostic Test ---');
console.log('User:      ', config.smtp.user);
console.log('Pass raw:  ', rawPass.slice(0, 4) + '************' + ` (length: ${rawPass.length})`);
console.log('Pass clean:', cleanPass.slice(0, 4) + '************' + ` (length: ${cleanPass.length})`);
console.log('Deliver to:', config.smtp.to);

if (!rawPass) {
  console.error('\nError: SMTP_PASS is missing in server/.env');
  process.exit(1);
}

const variations = [
  { name: 'Port 465 (SSL) + stripped password', transport: { host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: config.smtp.user, pass: cleanPass } } },
  { name: 'Port 465 (SSL) + verbatim password with spaces', transport: { host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: config.smtp.user, pass: rawPass } } },
  { name: 'Port 587 (TLS) + stripped password', transport: { host: 'smtp.gmail.com', port: 587, secure: false, auth: { user: config.smtp.user, pass: cleanPass } } },
];

let successfulTransport = null;

for (const v of variations) {
  process.stdout.write(`\nTrying ${v.name}... `);
  try {
    const t = nodemailer.createTransport(v.transport);
    await t.verify();
    console.log('✅ SUCCESS!');
    successfulTransport = t;
    break;
  } catch (err) {
    console.log('❌ FAILED: ' + err.message);
  }
}

if (successfulTransport) {
  console.log('\nSending test email to', config.smtp.to, '...');
  try {
    const info = await successfulTransport.sendMail({
      from: `"Portfolio Contact Test" <${config.smtp.user}>`,
      to: config.smtp.to,
      subject: 'Portfolio Contact Test - Success!',
      text: 'Congratulations! Your Gmail SMTP setup is working properly.',
    });
    console.log('✅ Email successfully sent! Message ID:', info.messageId);
    console.log('Check inbox for', config.smtp.to);
  } catch (err) {
    console.error('Failed to send email:', err.message);
  }
} else {
  console.log('\n❌ None of the variations succeeded.');
  console.log('\nThis confirms Google is rejecting the login credentials themselves.');
}
