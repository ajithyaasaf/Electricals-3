import { formatPrice } from "./currency";

export interface InvoiceOrderData {
  id: string;
  orderNumber?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status: string;
  shippingCost?: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    phone?: string;
  };
}

export interface InvoiceItemData {
  id: string;
  productName: string;
  productSku?: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;
}

export function printInvoice(order: InvoiceOrderData, items: InvoiceItemData[]) {
  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Please allow popup windows in your browser to print invoices.");
    return;
  }

  const orderNum = order.orderNumber || `#${order.id.slice(-8)}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subtotalPaise = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingPaise = order.shippingCost || 0;
  const grandTotalPaise = order.total || (subtotalPaise + shippingPaise);

  const itemsHtml = items.map((item, index) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #111827;">${item.productName}</strong>
        ${item.productSku ? `<br><small style="color: #6b7280;">SKU: ${item.productSku}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.unitPrice)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatPrice(item.unitPrice * item.quantity)}</td>
    </tr>
  `).join("");

  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice_${orderNum}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; background: #ffffff; }
          .invoice-box { max-width: 800px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .logo-title { font-size: 26px; font-weight: 800; color: #0d9488; letter-spacing: -0.5px; }
          .company-details { text-align: right; color: #4b5563; font-size: 12px; line-height: 1.6; }
          .invoice-badge { display: inline-block; background: #ccfbf1; color: #0f766e; font-weight: 700; font-size: 18px; padding: 6px 16px; border-radius: 6px; margin-bottom: 12px; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; }
          .meta-cell { width: 50%; vertical-align: top; padding: 16px; }
          .meta-label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .items-table th { background: #f3f4f6; color: #374151; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; padding: 12px 10px; border-bottom: 2px solid #e5e7eb; }
          .summary-table { width: 300px; margin-left: auto; border-collapse: collapse; margin-bottom: 24px; }
          .summary-table td { padding: 8px 12px; }
          .summary-label { color: #4b5563; font-size: 13px; }
          .summary-val { text-align: right; font-weight: 600; font-size: 13px; color: #111827; }
          .grand-total td { font-size: 15px; font-weight: 800; color: #0d9488; border-top: 2px solid #0d9488; border-bottom: 2px solid #0d9488; padding: 12px; }
          .terms-box { font-size: 11px; color: #6b7280; background: #f9fafb; padding: 12px 16px; border-radius: 6px; border: 1px solid #f3f4f6; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; font-weight: 500; }
          @media print {
            body { padding: 0; }
            .invoice-box { border: none; padding: 0; box-shadow: none; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #0d9488; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; display: inline-flex; items-center: center; gap: 8px;">
            🖨️ Print / Download PDF
          </button>
        </div>

        <div class="invoice-box">
          <table class="header-table">
            <tr>
              <td style="vertical-align: top;">
                <div class="logo-title">⚡ CopperBear</div>
                <div style="font-size: 12px; color: #4b5563; font-weight: 500; margin-top: 2px;">Solutions That Spark & Flow</div>
              </td>
              <td class="company-details">
                <strong style="color: #111827;">CopperBear Electricals Pvt. Ltd.</strong><br>
                Madurai Main Road, Tamil Nadu - 625001<br>
                Phone: +91 98765 43210 | Support: help@copperbear.com<br>
                GSTIN: 33AAAAA0000A1Z5
              </td>
            </tr>
          </table>

          <div style="border-top: 2px solid #0d9488; margin-bottom: 20px;"></div>

          <table class="meta-table">
            <tr>
              <td class="meta-cell" style="border-right: 1px solid #e5e7eb;">
                <div class="invoice-badge">TAX INVOICE</div>
                <div style="margin-bottom: 4px;"><strong>Order ID:</strong> ${orderNum}</div>
                <div style="margin-bottom: 4px;"><strong>Order Date:</strong> ${orderDate}</div>
                <div style="margin-bottom: 4px;"><strong>Payment Method:</strong> ${(order.paymentMethod || 'COD').toUpperCase()}</div>
                <div><strong>Payment Status:</strong> ${(order.paymentStatus || 'Completed').toUpperCase()}</div>
              </td>
              <td class="meta-cell">
                <div class="meta-label">Billed & Shipped To:</div>
                <div style="font-weight: 700; font-size: 14px; color: #111827; margin-bottom: 4px;">
                  ${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}
                </div>
                <div>${order.shippingAddress.street}</div>
                <div>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</div>
                <div style="margin-top: 4px;"><strong>Phone:</strong> ${order.shippingAddress.phone || order.customerPhone || 'N/A'}</div>
                <div><strong>Email:</strong> ${order.customerEmail || 'N/A'}</div>
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th style="text-align: left;">Product / Service Description</th>
                <th style="width: 110px; text-align: right;">Unit Price</th>
                <th style="width: 60px; text-align: center;">Qty</th>
                <th style="width: 120px; text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="summary-table">
            <tr>
              <td class="summary-label">Item Subtotal:</td>
              <td class="summary-val">${formatPrice(subtotalPaise)}</td>
            </tr>
            <tr>
              <td class="summary-label">Shipping & Delivery:</td>
              <td class="summary-val">${shippingPaise === 0 ? 'FREE' : formatPrice(shippingPaise)}</td>
            </tr>
            <tr class="grand-total">
              <td class="summary-label">Grand Total:</td>
              <td class="summary-val">${formatPrice(grandTotalPaise)}</td>
            </tr>
          </table>

          <div class="terms-box">
            <strong>Terms & Conditions:</strong><br>
            1. All electrical products carry manufacturer warranty as applicable.<br>
            2. Returns accepted within 7 days in original, undamaged packaging.<br>
            3. This is a computer-generated tax invoice and requires no physical signature.
          </div>

          <div class="footer">
            Thank you for doing business with CopperBear Electricals!
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}
