import dayjs from "dayjs";

// Returns HTML string for invoice — rendered by puppeteer or sent as HTML fallback
export const getInvoiceHTML = (invoice) => {
  const user = invoice.user || {};
  const customer = invoice.customer || {};
  const items = invoice.items || [];
  const fmt = (n) => "\u20a6" + (n || 0).toLocaleString("en-NG");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #0F172A; background: white; }
  .container { max-width: 700px; margin: 0 auto; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo { font-size: 28px; font-weight: 900; color: #6C38FF; }
  .invoice-label { text-align: right; }
  .invoice-label h2 { font-size: 32px; color: #6C38FF; font-weight: 900; }
  .invoice-label p { color: #64748B; font-size: 14px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
  .party h3 { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .party p { font-size: 14px; color: #334155; line-height: 1.6; }
  .party .name { font-size: 18px; font-weight: 700; color: #0F172A; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 32px; }
  .meta-item label { font-size: 11px; color: #94A3B8; text-transform: uppercase; display: block; margin-bottom: 4px; }
  .meta-item span { font-size: 14px; font-weight: 600; color: #0F172A; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #6C38FF; color: white; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; }
  td { padding: 12px 16px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
  tr:nth-child(even) td { background: #F8FAFC; }
  .totals { max-width: 280px; margin-left: auto; }
  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #F1F5F9; }
  .totals-row.total { font-size: 18px; font-weight: 900; color: #6C38FF; border-bottom: none; padding-top: 12px; }
  .footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 12px; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: ${invoice.status === "paid" ? "#D1FAE5" : invoice.status === "refunded" ? "#FEE2E2" : "#FEF3C7"}; color: ${invoice.status === "paid" ? "#065F46" : invoice.status === "refunded" ? "#991B1B" : "#92400E"}; }
</style>
</head>
<body>
<div class="container">
${
  invoice.status === "refunded"
    ? `
  <div style="background:#FEE2E2;border:2px solid #EF4444;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
    <p style="font-size:20px;font-weight:900;color:#EF4444;">↩️ REFUNDED</p>
    <p style="font-size:13px;color:#7F1D1D;margin-top:4px;">This invoice has been refunded on ${dayjs(invoice.refundedAt).format("D MMM YYYY")}</p>
    ${invoice.refundReason ? `<p style="font-size:12px;color:#991B1B;margin-top:4px;">Reason: ${invoice.refundReason}</p>` : ""}
  </div>`
    : ""
}
  <div class="header">
    <div>
      <div class="logo">Trackeet</div>
      <p style="color:#64748B;font-size:13px;margin-top:4px">${user.businessName || user.firstName + " " + user.lastName}</p>
      ${user.businessAddress ? `<p style="color:#94A3B8;font-size:12px">${user.businessAddress}</p>` : ""}
    </div>
    <div class="invoice-label">
      <h2>INVOICE</h2>
      <p>${invoice.invoiceNumber}</p>
      <span class="status-badge">${invoice.status?.toUpperCase()}</span>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>From</h3>
      <p class="name">${user.businessName || user.firstName + " " + user.lastName}</p>
      ${user.bankAccountNumber ? `<p style="font-size:12px;color:#94A3B8;margin-top:8px">Bank: ${user.bankName}<br/>${user.bankAccountNumber} (${user.bankAccountName})</p>` : ""}
    </div>
    <div class="party">
      <h3>Bill To</h3>
      <p class="name">${customer.name}</p>
      <p>${customer.phone || ""}</p>
      ${customer.email ? `<p>${customer.email}</p>` : ""}
      ${customer.address ? `<p>${customer.address}</p>` : ""}
    </div>
  </div>

  <div class="meta">
    <div class="meta-item"><label>Invoice Date</label><span>${dayjs(invoice.invoiceDate).format("D MMM YYYY")}</span></div>
    <div class="meta-item"><label>Due Date</label><span>${invoice.dueDate ? dayjs(invoice.dueDate).format("D MMM YYYY") : "—"}</span></div>
    <div class="meta-item"><label>Amount Due</label><span>${fmt(invoice.balance)}</span></div>
  </div>

  <table>
    <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>
      ${items.map((item) => `<tr><td>${item.name}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">${fmt(item.unitPrice)}</td><td style="text-align:right">${fmt(item.total || item.quantity * item.unitPrice)}</td></tr>`).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${fmt(invoice.subtotal)}</span></div>
    ${invoice.discountPercent > 0 ? `<div class="totals-row"><span>Discount (${invoice.discountPercent}%)</span><span>-${fmt(invoice.discountAmount)}</span></div>` : ""}
    <div class="totals-row total"><span>Total</span><span>${fmt(invoice.totalAmount)}</span></div>
    ${invoice.amountPaid > 0 ? `<div class="totals-row"><span>Amount Paid</span><span style="color:#10B981">-${fmt(invoice.amountPaid)}</span></div><div class="totals-row total"><span>Balance Due</span><span style="color:#EF4444">${fmt(invoice.balance)}</span></div>` : ""}
  </div>

  ${invoice.notes ? `<div style="margin-top:24px;padding:16px;background:#F8FAFC;border-radius:8px"><p style="font-size:12px;color:#94A3B8;font-weight:700;margin-bottom:4px">NOTES</p><p style="font-size:13px;color:#334155">${invoice.notes}</p></div>` : ""}

  <div class="footer">
    <p>Generated by Trackeet · gettrackeet.com</p>
    <p style="margin-top:4px">Thank you for your business!</p>
  </div>
</div>
</body>
</html>`;
};

export const generateInvoicePDF = async (invoice) => {
  try {
    const puppeteer = await import("puppeteer-core");
    const browser = await puppeteer.default.launch({
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(getInvoiceHTML(invoice), {
      waitUntil: "networkidle0",
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await browser.close();
    return pdf;
  } catch (err) {
    console.error("PDF gen error:", err.message);
    // Fallback: return HTML as buffer
    return Buffer.from(getInvoiceHTML(invoice));
  }
};
