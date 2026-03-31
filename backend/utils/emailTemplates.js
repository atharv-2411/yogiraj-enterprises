const baseLayout = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#2563EB;padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">Yogiraj Enterprises</h1>
            <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Precision Mechanical Parts Manufacturer</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
              © ${new Date().getFullYear()} Yogiraj Enterprises. All rights reserved.<br>
              This is an automated confirmation email. Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const tableRow = (label, value) =>
  value
    ? `<tr>
        <td style="padding:10px 14px;background:#f8fafc;font-size:13px;color:#64748b;font-weight:600;width:35%;border-bottom:1px solid #e2e8f0;">${label}</td>
        <td style="padding:10px 14px;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0;">${value}</td>
       </tr>`
    : "";

const contactConfirmationTemplate = (name, company, email, phone, message) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Thank you for contacting us, ${name}!</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
      We have received your message and will respond within <strong>24 hours</strong>.
    </p>

    <h3 style="margin:0 0 12px;color:#2563EB;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Your Submission Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      ${tableRow("Name", name)}
      ${tableRow("Company", company)}
      ${tableRow("Email", email)}
      ${tableRow("Phone", phone)}
      ${tableRow("Message", message)}
    </table>

    <div style="background:#eff6ff;border-left:4px solid #2563EB;padding:14px 16px;border-radius:0 6px 6px 0;">
      <p style="margin:0;color:#1e40af;font-size:13px;">
        Our team will review your message and get back to you at <strong>${email}</strong> within 24 hours.
      </p>
    </div>
  `);

const enquiryConfirmationTemplate = (
  company,
  contactName,
  email,
  partsDescription,
  quantity,
  material,
  deadline,
  dimensions,
  tolerance
) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Thank you for your enquiry, ${contactName}!</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
      Our engineering team will review your requirements and provide a quote within <strong>24 hours</strong>.
    </p>

    <h3 style="margin:0 0 12px;color:#2563EB;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Enquiry Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      ${tableRow("Company", company)}
      ${tableRow("Contact Name", contactName)}
      ${tableRow("Email", email)}
      ${tableRow("Parts Description", partsDescription)}
      ${tableRow("Quantity", quantity)}
      ${tableRow("Material", material)}
      ${tableRow("Deadline", deadline ? new Date(deadline).toDateString() : null)}
      ${tableRow("Dimensions", dimensions ? `L: ${dimensions.length || "-"} × W: ${dimensions.width || "-"} × H: ${dimensions.height || "-"}` : null)}
      ${tableRow("Tolerance", tolerance)}
    </table>

    <div style="background:#eff6ff;border-left:4px solid #2563EB;padding:14px 16px;border-radius:0 6px 6px 0;">
      <p style="margin:0;color:#1e40af;font-size:13px;">
        Our engineering team will review your enquiry and send a detailed quote to <strong>${email}</strong> within 24 hours.
      </p>
    </div>
  `);

module.exports = { contactConfirmationTemplate, enquiryConfirmationTemplate };
