import nodemailer from 'nodemailer';

/** Returns an email sender. When SMTP isn't configured it logs and reports "not delivered". */
export function createEmailSender(smtp, logger = console) {
  if (!smtp.host || !smtp.to || !smtp.pass) {
    logger.warn('SMTP password or host not configured; contact messages will be stored but not emailed.');
    return { send: async () => false };
  }

  const isGmail = smtp.host === 'smtp.gmail.com' || smtp.service === 'gmail';
  const transport = nodemailer.createTransport(
    isGmail
      ? {
          service: 'gmail',
          auth: { user: smtp.user, pass: smtp.pass },
        }
      : {
          host: smtp.host,
          port: smtp.port,
          secure: smtp.port === 465,
          auth: smtp.user && smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined,
        }
  );

  return {
    async send({ subject, text, replyTo, name, email }) {
      const senderDisplay = name ? `${name} (${email || replyTo})` : (email || replyTo || 'Portfolio Visitor');
      await transport.sendMail({
        from: `"${senderDisplay}" <${smtp.user}>`,
        to: smtp.to,
        subject: subject || `Portfolio contact from ${senderDisplay}`,
        text: `From: ${name || 'Visitor'} <${email || replyTo}>\nReply-To: ${email || replyTo}\nTo: ${smtp.to}\n\n${text}`,
        replyTo: email ? `"${name || email}" <${email}>` : replyTo,
      });
      return true;
    },
  };
}
