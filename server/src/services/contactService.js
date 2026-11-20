import { createHash } from 'node:crypto';

/**
 * Stores a validated contact message, then tries to email it.
 * The message is persisted even if email delivery fails, so nothing is lost.
 */
export function createContactService({ db, emailSender, logger = console }) {
  const insert = db.prepare('INSERT INTO contact_messages (name, email, message, ip_hash) VALUES (?, ?, ?, ?)');
  const markDelivered = db.prepare('UPDATE contact_messages SET email_delivered = 1 WHERE id = ?');

  return {
    async submit({ name, email, message }, ip) {
      const ipHash = ip ? createHash('sha256').update(ip).digest('hex').slice(0, 16) : null;
      const { lastInsertRowid } = insert.run(name, email, message, ipHash);
      const id = Number(lastInsertRowid);

      let delivered = false;
      let sendError;
      try {
        delivered = await emailSender.send({
          name,
          email,
          subject: `Portfolio contact from ${name}`,
          replyTo: email,
          text: `From: ${name} <${email}>\n\n${message}`,
        });
        if (delivered) markDelivered.run(id);
      } catch (err) {
        sendError = err.message;
        logger.error(`Contact email ${id} failed: ${err.message}`);
      }
      const outcome = { id, delivered };
      if (sendError) outcome.error = sendError;
      return outcome;
    },
  };
}
