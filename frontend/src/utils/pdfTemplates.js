import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const fmtN = (n) => "N" + Number(n || 0).toLocaleString("en-NG");
const addRefundBanner = (doc, inv) => {
  if (inv.status !== "refunded") return;
  const W = 210;
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(14, 48, W - 28, 18, 3, 3, "F");
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 48, W - 28, 18, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(153, 27, 27);
  doc.text("↩ REFUNDED", 105, 56, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(127, 29, 29);
  const refundDate = inv.refundedAt
    ? dayjs(inv.refundedAt).format("D MMM YYYY")
    : dayjs().format("D MMM YYYY");
  const reason = inv.refundReason ? ` · Reason: ${inv.refundReason}` : "";
  doc.text(`Refunded on ${refundDate}${reason}`, 105, 62, { align: "center" });
};

// TEMPLATE 1: CLASSIC PURPLE
export const classicTemplate = (inv, bizName, bizAddress) => {
  const doc = new jsPDF("p", "mm", "a4");
  const primary = [124, 58, 237];
  const secondary = [99, 102, 241];
  const dark = [15, 23, 42];
  const gray = [100, 116, 139];
  const light = [248, 250, 252];
  const success = [16, 185, 129];
  const danger = [239, 68, 68];
  const warning = [245, 158, 11];
  const W = 210;

  const status =
    inv.status === "refunded"
      ? { text: "REFUNDED", color: danger }
      : inv.txStatus === "failed"
        ? { text: "FAILED", color: danger }
        : inv.txStatus === "reversed"
          ? { text: "REVERSED", color: warning }
          : inv.txStatus === "pending"
            ? { text: "PENDING", color: warning }
            : inv.status === "partial"
              ? { text: "PARTIAL", color: warning }
              : inv.status === "overdue"
                ? { text: "OVERDUE", color: danger }
                : inv.status === "pending"
                  ? { text: "PENDING", color: warning }
                  : { text: "PAID", color: success };

  doc.setFillColor(...primary);
  doc.rect(0, 0, W, 45, "F");
  doc.setFillColor(...secondary);
  doc.circle(180, 10, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(bizName?.toUpperCase() || "TRACKEET", 15, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Smart Invoice Management", 15, 28);
  doc.text(bizAddress || "gettrackeet.com", 15, 34);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(135, 12, 60, 25, 4, 4, "F");
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", 190, 22, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(inv.invoiceNumber || "", 190, 29, { align: "right" });

  doc.setFillColor(...status.color);
  doc.roundedRect(160, 32, 30, 7, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(status.text, 175, 36.5, { align: "center" });

  addRefundBanner(doc, inv);
  let y = 60;
  doc.setFillColor(...light);
  doc.roundedRect(14, y, 85, 42, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text("BILLED TO", 20, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...dark);
  doc.text(inv.customer?.name || "Customer", 20, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  if (inv.customer?.phone) doc.text(inv.customer.phone, 20, y + 27);
  if (inv.customer?.email) doc.text(inv.customer.email, 20, y + 35);

  const infoRows = [
    [
      "Invoice Date",
      inv.invoiceDate ? dayjs(inv.invoiceDate).format("DD MMM YYYY") : "—",
    ],
    ...(inv.dueDate
      ? [["Due Date", dayjs(inv.dueDate).format("DD MMM YYYY")]]
      : []),
    ...(inv.balance > 0 ? [["Amount Due", fmtN(inv.balance)]] : []),
  ];
  const rightCardH = Math.max(42, 10 + infoRows.length * 11 + 6);
  doc.setFillColor(...light);
  doc.roundedRect(110, y, 86, rightCardH, 4, 4, "F");
  let infoY = y + 10;
  infoRows.forEach((row, i) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(row[0], 116, infoY);
    doc.setFont(
      "helvetica",
      i === infoRows.length - 1 && inv.balance > 0 ? "bold" : "normal",
    );
    const tc = i === infoRows.length - 1 && inv.balance > 0 ? primary : dark;
    doc.setTextColor(...tc);
    doc.text(row[1], 190, infoY, { align: "right" });
    infoY += 11;
  });

  autoTable(doc, {
    startY: 115,
    head: [["DESCRIPTION", "QTY", "PRICE", "TOTAL"]],
    body: (inv.items || []).map((item) => [
      item.name + (item.description ? `\n${item.description}` : ""),
      String(item.quantity || 1),
      fmtN(item.unitPrice),
      fmtN(item.total || item.quantity * item.unitPrice),
    ]),
    theme: "plain",
    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: dark,
      cellPadding: 5,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;
  const totals = [
    { label: "Subtotal", value: fmtN(inv.subtotal), color: dark },
    ...(inv.delivery?.enabled &&
    inv.delivery?.feeType === "fixed" &&
    inv.delivery?.fee > 0
      ? [
          {
            label: "Delivery Fee",
            value: `+ ${fmtN(inv.delivery.fee)}`,
            color: dark,
          },
        ]
      : inv.delivery?.enabled && inv.delivery?.feeType === "free"
        ? [{ label: "Delivery Fee", value: "FREE", color: success }]
        : inv.delivery?.enabled && inv.delivery?.feeType === "pay_on_delivery"
          ? [{ label: "Delivery Fee", value: "Pay Rider", color: warning }]
          : []),
    ...(inv.discountPercent > 0
      ? [
          {
            label: `Discount (${inv.discountPercent}%)`,
            value: `- ${fmtN(inv.discountAmount)}`,
            color: success,
          },
        ]
      : []),
    {
      label: "Total",
      value: fmtN(inv.totalAmount),
      color: primary,
      bold: true,
    },
    ...(inv.amountPaid > 0
      ? [
          { label: "Paid", value: fmtN(inv.amountPaid), color: success },
          ...(inv.balance > 0
            ? [
                {
                  label: "Balance",
                  value: fmtN(inv.balance),
                  color: danger,
                  bold: true,
                },
              ]
            : []),
        ]
      : []),
  ];
  const totalsH = 10 + totals.length * 8 + 6;
  doc.setFillColor(...light);
  doc.roundedRect(118, y, 78, totalsH, 4, 4, "F");
  let tY = y + 10;
  totals.forEach((row) => {
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    doc.setFontSize(row.bold ? 11 : 10);
    doc.setTextColor(...gray);
    doc.text(row.label, 124, tY);
    doc.setTextColor(...(row.color || dark));
    doc.text(row.value, 190, tY, { align: "right" });
    tY += 8;
  });

  if (inv.notes) {
    y = tY + 10;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, y, W - 28, 28, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text("NOTES", 20, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(inv.notes, 165), 20, y + 16);
  }

  if (inv.delivery?.enabled) {
    y = inv.notes ? y + 32 : tY + 10;
    addDeliverySection(doc, inv, y, primary, gray, dark, light);
  }

  doc.setFillColor(...dark);
  doc.rect(0, 285, W, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `Generated by ${bizName || "Trackeet"} • gettrackeet.com • Thank you for your business`,
    105,
    292,
    { align: "center" },
  );

  return doc;
};

//  TEMPLATE 2: MINIMAL
export const minimalTemplate = (inv, bizName, bizAddress) => {
  const doc = new jsPDF("p", "mm", "a4");
  const dark = [10, 10, 10];
  const gray = [120, 120, 120];
  const light = [245, 245, 245];
  const W = 210;

  const statusColor =
    inv.status === "refunded"
      ? danger
      : inv.status === "paid"
        ? [16, 185, 129]
        : inv.status === "overdue"
          ? [239, 68, 68]
          : [100, 116, 139];

  // Top line
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(...dark);
  doc.text(bizName?.toUpperCase() || "TRACKEET", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(bizAddress || "gettrackeet.com", 14, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...gray);
  doc.text("INVOICE", W - 14, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text(inv.invoiceNumber || "", W - 14, 26, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...statusColor);
  doc.text((inv.status || "").toUpperCase(), W - 14, 33, { align: "right" });

  addRefundBanner(doc, inv);
  // Divider
  doc.setDrawColor(...light);
  doc.setLineWidth(0.5);
  doc.line(14, 40, W - 14, 40);

  // Billed to
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("BILLED TO", 14, 52);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text(inv.customer?.name || "", 14, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  if (inv.customer?.phone) doc.text(inv.customer.phone, 14, 70);
  if (inv.customer?.email) doc.text(inv.customer.email, 14, 77);

  // Dates right
  const dateRows = [
    [
      "DATE",
      inv.invoiceDate ? dayjs(inv.invoiceDate).format("DD MMM YYYY") : "—",
    ],
    ...(inv.dueDate ? [["DUE", dayjs(inv.dueDate).format("DD MMM YYYY")]] : []),
    ...(inv.balance > 0 ? [["AMOUNT DUE", fmtN(inv.balance)]] : []),
  ];
  let dY = 52;
  dateRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(label, W - 14, dY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    doc.text(val, W - 14, dY + 7, { align: "right" });
    dY += 18;
  });

  doc.line(14, 90, W - 14, 90);

  autoTable(doc, {
    startY: 96,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: (inv.items || []).map((item) => [
      item.name + (item.description ? `\n${item.description}` : ""),
      String(item.quantity || 1),
      fmtN(item.unitPrice),
      fmtN(item.total || item.quantity * item.unitPrice),
    ]),
    theme: "plain",
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [100, 100, 100],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: dark,
      cellPadding: 5,
      lineColor: [235, 235, 235],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 40 },
      3: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  let y = doc.lastAutoTable.finalY + 8;
  doc.line(14, y, W - 14, y);
  y += 8;

  const totals = [
    { label: "Subtotal", value: fmtN(inv.subtotal) },
    ...(inv.delivery?.enabled &&
    inv.delivery?.feeType === "fixed" &&
    inv.delivery?.fee > 0
      ? [{ label: "Delivery Fee", value: `+ ${fmtN(inv.delivery.fee)}` }]
      : inv.delivery?.enabled && inv.delivery?.feeType === "free"
        ? [{ label: "Delivery Fee", value: "FREE" }]
        : inv.delivery?.enabled && inv.delivery?.feeType === "pay_on_delivery"
          ? [{ label: "Delivery Fee", value: "Pay Rider" }]
          : []),
    ...(inv.discountPercent > 0
      ? [
          {
            label: `Discount (${inv.discountPercent}%)`,
            value: `- ${fmtN(inv.discountAmount)}`,
          },
        ]
      : []),
    { label: "Total", value: fmtN(inv.totalAmount), bold: true },
    ...(inv.amountPaid > 0
      ? [
          {
            label: "Amount Paid",
            value: fmtN(inv.amountPaid),
            color: [16, 185, 129],
          },
        ]
      : []),
    ...(inv.balance > 0
      ? [
          {
            label: "Balance Due",
            value: fmtN(inv.balance),
            bold: true,
            color: [239, 68, 68],
          },
        ]
      : []),
  ];
  totals.forEach((row) => {
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    doc.setFontSize(row.bold ? 11 : 10);
    doc.setTextColor(...(row.color || gray));
    doc.text(row.label, 130, y);
    doc.setTextColor(...(row.color || (row.bold ? dark : gray)));
    doc.text(row.value, W - 14, y, { align: "right" });
    y += 8;
  });

  if (inv.notes) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("NOTES", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(inv.notes, 170), 14, y + 7);
  }

  if (inv.delivery?.enabled) {
    y = inv.notes ? y + 20 : y + 10;
    addDeliverySection(doc, inv, y, dark, gray, dark, light);
  }

  // Bottom line
  doc.setFillColor(...dark);
  doc.rect(0, 287, W, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(`${bizName || "Trackeet"} · Thank you for your business`, 105, 295, {
    align: "center",
  });

  return doc;
};

//  TEMPLATE 3: BOLD DARK
export const boldTemplate = (inv, bizName, bizAddress) => {
  const doc = new jsPDF("p", "mm", "a4");
  const black = [10, 10, 10];
  const accent = [250, 204, 21]; // yellow
  const white = [255, 255, 255];
  const gray = [150, 150, 150];
  const lgray = [240, 240, 240];
  const success = [16, 185, 129];
  const danger = [239, 68, 68];
  const W = 210;

  const statusColor =
    inv.status === "refunded"
      ? danger
      : inv.status === "paid"
        ? success
        : inv.status === "overdue"
          ? danger
          : [150, 150, 150];

  // Full dark header
  doc.setFillColor(...black);
  doc.rect(0, 0, W, 55, "F");

  // Yellow accent bar
  doc.setFillColor(...accent);
  doc.rect(0, 55, W, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...white);
  doc.text(bizName?.toUpperCase() || "TRACKEET", 14, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(bizAddress || "gettrackeet.com", 14, 33);

  // Invoice number right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...accent);
  doc.text("INVOICE", W - 14, 18, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...white);
  doc.text(inv.invoiceNumber || "", W - 14, 28, { align: "right" });

  // Status pill
  doc.setFillColor(...statusColor);
  doc.roundedRect(W - 50, 34, 36, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...white);
  doc.text((inv.status || "").toUpperCase(), W - 32, 39.5, { align: "center" });

  addRefundBanner(doc, inv);
  // Customer section
  let y = 70;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...accent);
  doc.text("BILLED TO", 14, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...black);
  doc.text(inv.customer?.name || "", 14, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  if (inv.customer?.phone) doc.text(inv.customer.phone, 14, y + 18);
  if (inv.customer?.email) doc.text(inv.customer.email, 14, y + 25);

  // Info right
  const infoRows = [
    [
      "DATE",
      inv.invoiceDate ? dayjs(inv.invoiceDate).format("DD MMM YYYY") : "—",
    ],
    ...(inv.dueDate
      ? [["DUE DATE", dayjs(inv.dueDate).format("DD MMM YYYY")]]
      : []),
    ...(inv.balance > 0 ? [["AMOUNT DUE", fmtN(inv.balance)]] : []),
  ];
  let iY = y;
  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...accent);
    doc.text(label, W - 14, iY, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text(val, W - 14, iY + 8, { align: "right" });
    iY += 18;
  });

  autoTable(doc, {
    startY: 108,
    head: [["DESCRIPTION", "QTY", "PRICE", "TOTAL"]],
    body: (inv.items || []).map((item) => [
      item.name + (item.description ? `\n${item.description}` : ""),
      String(item.quantity || 1),
      fmtN(item.unitPrice),
      fmtN(item.total || item.quantity * item.unitPrice),
    ]),
    theme: "plain",
    headStyles: {
      fillColor: black,
      textColor: accent,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: black,
      cellPadding: 5,
      lineColor: lgray,
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 40 },
      3: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;
  doc.setFillColor(...black);
  doc.roundedRect(118, y, 78, 6 + (inv.amountPaid > 0 ? 32 : 20), 3, 3, "F");
  let tY = y + 10;
  const totals = [
    ...(inv.delivery?.enabled &&
    inv.delivery?.feeType === "fixed" &&
    inv.delivery?.fee > 0
      ? [{ label: "Delivery Fee", value: `+ ${fmtN(inv.delivery.fee)}` }]
      : inv.delivery?.enabled && inv.delivery?.feeType === "free"
        ? [{ label: "Delivery Fee", value: "FREE", green: true }]
        : inv.delivery?.enabled && inv.delivery?.feeType === "pay_on_delivery"
          ? [{ label: "Delivery Fee", value: "Pay Rider" }]
          : []),
    { label: "Total", value: fmtN(inv.totalAmount), accent: true },
    ...(inv.amountPaid > 0
      ? [{ label: "Paid", value: fmtN(inv.amountPaid), green: true }]
      : []),
    ...(inv.balance > 0
      ? [{ label: "Balance", value: fmtN(inv.balance), red: true }]
      : []),
  ];
  totals.forEach((row) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text(row.label, 124, tY);
    doc.setTextColor(
      ...(row.accent
        ? accent
        : row.green
          ? [16, 185, 129]
          : row.red
            ? [239, 68, 68]
            : white),
    );
    doc.text(row.value, 190, tY, { align: "right" });
    tY += 9;
  });

  if (inv.notes) {
    y = tY + 12;
    doc.setFillColor(...lgray);
    doc.roundedRect(14, y, W - 28, 24, 3, 3, "F");
    doc.setFillColor(...accent);
    doc.roundedRect(14, y, 3, 24, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("NOTES", 22, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text(doc.splitTextToSize(inv.notes, 160), 22, y + 16);
  }

  if (inv.delivery?.enabled) {
    y = inv.notes ? y + 32 : tY + 10;
    addDeliverySection(doc, inv, y, accent, gray, black, lgray);
  }

  doc.setFillColor(...black);
  doc.rect(0, 282, W, 15, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 282, W, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(`${bizName || "Trackeet"} · Thank you for your business`, 105, 292, {
    align: "center",
  });

  return doc;
};

// TEMPLATE 4: PROFESSIONAL BLUE
export const professionalTemplate = (inv, bizName, bizAddress) => {
  const doc = new jsPDF("p", "mm", "a4");
  const blue = [37, 99, 235];
  const navy = [30, 58, 138];
  const dark = [15, 23, 42];
  const gray = [100, 116, 139];
  const light = [239, 246, 255];
  const success = [16, 185, 129];
  const danger = [239, 68, 68];
  const W = 210;

  const statusColor =
    inv.status === "refunded"
      ? danger
      : inv.status === "paid"
        ? success
        : inv.status === "overdue"
          ? danger
          : gray;

  // Header
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 40, "F");
  doc.setFillColor(...blue);
  doc.rect(0, 40, W, 5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(bizName?.toUpperCase() || "TRACKEET", 14, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 200, 255);
  doc.text(bizAddress || "gettrackeet.com", 14, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", W - 14, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 200, 255);
  doc.text(inv.invoiceNumber || "", W - 14, 28, { align: "right" });
  addRefundBanner(doc, inv);

  // Blue info strip
  doc.setFillColor(...light);
  doc.rect(0, 45, W, 45, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...blue);
  doc.text("BILLED TO", 14, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...dark);
  doc.text(inv.customer?.name || "", 14, 68);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  if (inv.customer?.phone) doc.text(inv.customer.phone, 14, 76);
  if (inv.customer?.email) doc.text(inv.customer.email, 14, 83);

  // Status badge
  doc.setFillColor(...statusColor);
  doc.roundedRect(W - 55, 52, 41, 9, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text((inv.status || "").toUpperCase(), W - 34.5, 57.5, {
    align: "center",
  });

  const dateRows = [
    [
      "Invoice Date",
      inv.invoiceDate ? dayjs(inv.invoiceDate).format("DD MMM YYYY") : "—",
    ],
    ...(inv.dueDate
      ? [["Due Date", dayjs(inv.dueDate).format("DD MMM YYYY")]]
      : []),
    ...(inv.balance > 0 ? [["Amount Due", fmtN(inv.balance)]] : []),
  ];
  let dY = 65;
  dateRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...blue);
    doc.text(label, W - 14, dY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    doc.text(val, W - 14, dY + 7, { align: "right" });
    dY += 16;
  });

  autoTable(doc, {
    startY: 97,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: (inv.items || []).map((item) => [
      item.name + (item.description ? `\n${item.description}` : ""),
      String(item.quantity || 1),
      fmtN(item.unitPrice),
      fmtN(item.total || item.quantity * item.unitPrice),
    ]),
    theme: "plain",
    headStyles: {
      fillColor: blue,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: dark,
      cellPadding: 5,
      lineColor: [219, 234, 254],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 40 },
      3: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  let y = doc.lastAutoTable.finalY + 12;
  doc.setFillColor(...light);
  const tRows = [
    { label: "Subtotal", value: fmtN(inv.subtotal) },
    ...(inv.delivery?.enabled &&
    inv.delivery?.feeType === "fixed" &&
    inv.delivery?.fee > 0
      ? [{ label: "Delivery Fee", value: `+ ${fmtN(inv.delivery.fee)}` }]
      : inv.delivery?.enabled && inv.delivery?.feeType === "free"
        ? [{ label: "Delivery Fee", value: "FREE" }]
        : inv.delivery?.enabled && inv.delivery?.feeType === "pay_on_delivery"
          ? [{ label: "Delivery Fee", value: "Pay Rider" }]
          : []),
    ...(inv.discountPercent > 0
      ? [
          {
            label: `Discount (${inv.discountPercent}%)`,
            value: `- ${fmtN(inv.discountAmount)}`,
            green: true,
          },
        ]
      : []),
    { label: "Total", value: fmtN(inv.totalAmount), bold: true, blue: true },
    ...(inv.amountPaid > 0
      ? [{ label: "Paid", value: fmtN(inv.amountPaid), green: true }]
      : []),
    ...(inv.balance > 0
      ? [
          {
            label: "Balance Due",
            value: fmtN(inv.balance),
            bold: true,
            red: true,
          },
        ]
      : []),
  ];
  doc.roundedRect(118, y, 78, 8 + tRows.length * 9, 3, 3, "F");
  let tY = y + 9;
  tRows.forEach((row) => {
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    doc.setFontSize(row.bold ? 11 : 10);
    doc.setTextColor(...gray);
    doc.text(row.label, 124, tY);
    doc.setTextColor(
      ...(row.blue ? blue : row.green ? success : row.red ? danger : dark),
    );
    doc.text(row.value, 190, tY, { align: "right" });
    tY += 9;
  });

  if (inv.notes) {
    y = tY + 10;
    doc.setFillColor(...light);
    doc.roundedRect(14, y, W - 28, 24, 3, 3, "F");
    doc.setFillColor(...blue);
    doc.roundedRect(14, y, 3, 24, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...blue);
    doc.text("NOTES", 22, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(inv.notes, 160), 22, y + 16);
  }

  if (inv.delivery?.enabled) {
    y = inv.notes ? y + 32 : tY + 10;
    addDeliverySection(doc, inv, y, blue, gray, dark, light);
  }

  doc.setFillColor(...navy);
  doc.rect(0, 284, W, 13, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 255);
  doc.text(
    `${bizName || "Trackeet"} · Professional Invoice · Thank you for your business`,
    105,
    292,
    { align: "center" },
  );

  return doc;
};

// TEMPLATE 5: WARM
export const warmTemplate = (inv, bizName, bizAddress) => {
  const doc = new jsPDF("p", "mm", "a4");
  const orange = [234, 88, 12];
  const amber = [245, 158, 11];
  const dark = [28, 25, 23];
  const gray = [120, 113, 108];
  const cream = [254, 252, 232];
  const light = [255, 247, 237];
  const success = [16, 185, 129];
  const danger = [239, 68, 68];
  const W = 210;

  const statusColor =
    inv.status === "refunded"
      ? danger
      : inv.status === "paid"
        ? success
        : inv.status === "overdue"
          ? danger
          : [120, 113, 108];

  // Warm header
  doc.setFillColor(...orange);
  doc.rect(0, 0, W, 8, "F");
  doc.setFillColor(...amber);
  doc.rect(0, 8, W, 3, "F");
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 11, W, 45, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...dark);
  doc.text(bizName?.toUpperCase() || "TRACKEET", 14, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(bizAddress || "gettrackeet.com", 14, 39);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...orange);
  doc.text("INVOICE", W - 14, 22, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...dark);
  doc.text(inv.invoiceNumber || "", W - 14, 32, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...statusColor);
  doc.text((inv.status || "").toUpperCase(), W - 14, 40, { align: "right" });

  addRefundBanner(doc, inv);
  // Cream info section
  doc.setFillColor(...cream);
  doc.rect(0, 56, W, 50, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...orange);
  doc.text("BILLED TO", 14, 68);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...dark);
  doc.text(inv.customer?.name || "", 14, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  if (inv.customer?.phone) doc.text(inv.customer.phone, 14, 86);
  if (inv.customer?.email) doc.text(inv.customer.email, 14, 93);

  const dateRows = [
    [
      "Invoice Date",
      inv.invoiceDate ? dayjs(inv.invoiceDate).format("DD MMM YYYY") : "—",
    ],
    ...(inv.dueDate
      ? [["Due Date", dayjs(inv.dueDate).format("DD MMM YYYY")]]
      : []),
    ...(inv.balance > 0 ? [["Amount Due", fmtN(inv.balance)]] : []),
  ];
  let dY = 68;
  dateRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...orange);
    doc.text(label, W - 14, dY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    doc.text(val, W - 14, dY + 7, { align: "right" });
    dY += 16;
  });

  autoTable(doc, {
    startY: 112,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: (inv.items || []).map((item) => [
      item.name + (item.description ? `\n${item.description}` : ""),
      String(item.quantity || 1),
      fmtN(item.unitPrice),
      fmtN(item.total || item.quantity * item.unitPrice),
    ]),
    theme: "plain",
    headStyles: {
      fillColor: orange,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: dark,
      cellPadding: 5,
      lineColor: [254, 215, 170],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: light },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 40 },
      3: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  let y = doc.lastAutoTable.finalY + 12;
  doc.setFillColor(...cream);
  const tRows = [
    { label: "Subtotal", value: fmtN(inv.subtotal) },
    ...(inv.delivery?.enabled &&
    inv.delivery?.feeType === "fixed" &&
    inv.delivery?.fee > 0
      ? [{ label: "Delivery Fee", value: `+ ${fmtN(inv.delivery.fee)}` }]
      : inv.delivery?.enabled && inv.delivery?.feeType === "free"
        ? [{ label: "Delivery Fee", value: "FREE" }]
        : inv.delivery?.enabled && inv.delivery?.feeType === "pay_on_delivery"
          ? [{ label: "Delivery Fee", value: "Pay Rider" }]
          : []),
    ...(inv.discountPercent > 0
      ? [
          {
            label: `Discount (${inv.discountPercent}%)`,
            value: `- ${fmtN(inv.discountAmount)}`,
            green: true,
          },
        ]
      : []),
    { label: "Total", value: fmtN(inv.totalAmount), bold: true, orange: true },
    ...(inv.amountPaid > 0
      ? [{ label: "Paid", value: fmtN(inv.amountPaid), green: true }]
      : []),
    ...(inv.balance > 0
      ? [
          {
            label: "Balance Due",
            value: fmtN(inv.balance),
            bold: true,
            red: true,
          },
        ]
      : []),
  ];
  doc.roundedRect(118, y, 78, 8 + tRows.length * 9, 4, 4, "F");
  let tY = y + 9;
  tRows.forEach((row) => {
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    doc.setFontSize(row.bold ? 11 : 10);
    doc.setTextColor(...gray);
    doc.text(row.label, 124, tY);
    doc.setTextColor(
      ...(row.orange ? orange : row.green ? success : row.red ? danger : dark),
    );
    doc.text(row.value, 190, tY, { align: "right" });
    tY += 9;
  });

  if (inv.notes) {
    y = tY + 10;
    doc.setFillColor(...cream);
    doc.roundedRect(14, y, W - 28, 24, 4, 4, "F");
    doc.setFillColor(...orange);
    doc.roundedRect(14, y, 3, 24, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...orange);
    doc.text("NOTES", 22, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(inv.notes, 160), 22, y + 16);
  }

  if (inv.delivery?.enabled) {
    y = inv.notes ? y + 32 : tY + 10;
    addDeliverySection(doc, inv, y, orange, gray, dark, cream);
  }

  doc.setFillColor(...orange);
  doc.rect(0, 284, W, 3, "F");
  doc.setFillColor(...amber);
  doc.rect(0, 287, W, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `${bizName || "Trackeet"} · Thank you for your business! 🙏`,
    105,
    293,
    { align: "center" },
  );

  return doc;
};

// HELPERS
const loadImageAsBase64 = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });

const addProductPhotosToPDF = async (doc, photos) => {
  if (!photos?.length) return;
  const W = 210,
    M = 14,
    gap = 4;
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Product Photos", M, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${photos.length} photo${photos.length > 1 ? "s" : ""} attached`,
    M,
    28,
  );

  const photoW = (W - M * 2 - gap) / 2;
  const photoH = photoW * 0.75;
  let x = M,
    y = 36;

  for (let i = 0; i < photos.length; i++) {
    try {
      const imgData = await loadImageAsBase64(photos[i]);
      doc.addImage(imgData, "JPEG", x, y, photoW, photoH, undefined, "FAST");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(x, y, photoW, photoH);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Photo ${i + 1}`, x + 2, y + photoH - 2);
    } catch (err) {
      doc.setFillColor(248, 250, 252);
      doc.rect(x, y, photoW, photoH, "F");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("Photo unavailable", x + photoW / 2, y + photoH / 2, {
        align: "center",
      });
    }
    if (i % 2 === 0) {
      x = M + photoW + gap;
    } else {
      x = M;
      y += photoH + gap;
      if (y + photoH > 270) {
        doc.addPage();
        y = 20;
      }
    }
  }
};

const addDeliverySection = (doc, inv, y, primaryColor, gray, dark, light) => {
  if (!inv.delivery?.enabled) return y;

  const fmtFee = (n) => "N" + Number(n || 0).toLocaleString("en-NG");
  const W = 210;

  y += 10;
  doc.setFillColor(...light);
  doc.roundedRect(14, y, W - 28, 6, 2, 2, "F");
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, y, 3, 6, 1, 1, "F");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text("DELIVERY INFORMATION", 22, y + 4);

  y += 10;

  // Status
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("Status:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...dark);
  doc.text((inv.delivery.status || "Pending").toUpperCase(), 50, y);

  // Fee
  if (inv.delivery.feeType && inv.delivery.feeType !== "none") {
    const feeText =
      inv.delivery.feeType === "fixed" && inv.delivery.fee > 0
        ? fmtFee(inv.delivery.fee)
        : inv.delivery.feeType === "free"
          ? "FREE"
          : "Pay Rider on Delivery";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Delivery Fee:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(feeText, 150, y);
  }

  y += 7;

  // Address
  if (inv.delivery.address) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Address:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    const cleanAddr = inv.delivery.address
      .replace(
        /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{1F300}-\u{1F9FF}]/gu,
        "",
      )
      .trim();
    const addrLines = doc.splitTextToSize(cleanAddr, 130);
    doc.text(addrLines, 50, y);
    y += (addrLines.length - 1) * 5;
    y += 7;
  }

  // Est delivery date
  if (inv.delivery.estimatedDate) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Est. Delivery:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(dayjs(inv.delivery.estimatedDate).format("D MMM YYYY"), 50, y);
    y += 7;
  }

  // Shipped / Delivered dates
  if (inv.delivery.shippedAt) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Shipped On:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(dayjs(inv.delivery.shippedAt).format("D MMM YYYY"), 50, y);
    y += 7;
  }

  if (inv.delivery.deliveredAt) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Delivered On:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text(dayjs(inv.delivery.deliveredAt).format("D MMM YYYY"), 50, y);
    y += 7;
  }

  // Delivery notes
  if (inv.delivery.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Notes:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    const cleanNotes = inv.delivery.notes
      .replace(
        /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{1F300}-\u{1F9FF}]/gu,
        "",
      )
      .trim();
    doc.text(doc.splitTextToSize(cleanNotes, 140), 50, y);
    y += 7;
  }

  return y;
};

//  MAIN EXPORT
export const generatePDF = async (
  inv,
  template = "classic",
  bizName = "TRACKEET",
  bizAddr = "gettrackeet.com",
) => {
  let doc;
  switch (template) {
    case "minimal":
      doc = minimalTemplate(inv, bizName, bizAddr);
      break;
    case "bold":
      doc = boldTemplate(inv, bizName, bizAddr);
      break;
    case "professional":
      doc = professionalTemplate(inv, bizName, bizAddr);
      break;
    case "warm":
      doc = warmTemplate(inv, bizName, bizAddr);
      break;
    default:
      doc = classicTemplate(inv, bizName, bizAddr);
      break;
  }

  if (inv.productPhotos?.length > 0) {
    await addProductPhotosToPDF(doc, inv.productPhotos);
  }

  return doc;
};
