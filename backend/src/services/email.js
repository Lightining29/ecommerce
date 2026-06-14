import nodemailer from 'nodemailer';
import { formatPrice } from '../utils/format.js';

function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

export async function sendOrderReceipt(order, userEmail) {
  const transporter = createTransporter();
  const email = order.shippingAddress?.email || userEmail;
  if (!email) return false;

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.price * item.quantity)}</td></tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#F8FCFE;padding:32px;border-radius:16px">
      <h1 style="color:#3A9BC4;font-family:Georgia,serif;margin:0 0 8px">Glowora</h1>
      <p style="color:#6B7C8D;margin:0 0 24px">Thank you for your purchase!</p>
      <div style="background:white;padding:24px;border-radius:12px;box-shadow:0 4px 24px rgba(135,206,235,0.15)">
        <h2 style="margin:0 0 16px;color:#1A2B3C">Receipt — ${order.orderNumber}</h2>
        <p style="color:#6B7C8D;margin:0 0 16px">Date: ${new Date(order.createdAt).toLocaleString()}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <thead><tr style="background:#E8F4FA">
            <th style="padding:8px;text-align:left">Item</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="border-top:2px solid #87CEEB;padding-top:12px">
          <p style="margin:4px 0"><strong>Subtotal:</strong> ${formatPrice(order.subtotal)}</p>
          ${order.discount > 0 ? `<p style="margin:4px 0;color:#3A9BC4"><strong>Discount:</strong> -${formatPrice(order.discount)}</p>` : ''}
          <p style="margin:8px 0 0;font-size:1.2em"><strong>Total Paid:</strong> ${formatPrice(order.total)}</p>
        </div>
        <p style="margin:16px 0 0;color:#6B7C8D;font-size:0.9em">Status: ${order.status.replace('_', ' ').toUpperCase()}</p>
      </div>
      <p style="color:#94A3B4;font-size:0.85em;margin-top:24px;text-align:center">© Glowora Skincare</p>
    </div>`;

  if (!transporter) {
    console.log(`[Email Demo] Receipt for ${order.orderNumber} → ${email}`);
    console.log(`Total: ${formatPrice(order.total)}`);
    return true;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Glowora" <noreply@glowora.com>',
    to: email,
    subject: `Your Glowora Receipt — ${order.orderNumber}`,
    html,
  });
  return true;
}
