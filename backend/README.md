# Trackeet Backend

## Stack

- Node.js + Express (ES Modules)
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (real-time notifications)
- WhatsApp Web.js (automation)
- Paystack + Flutterwave (payments)
- Nodemailer (email)
- Puppeteer (PDF generation)
- node-cron (scheduled jobs)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Seed the superadmin

```bash
npm run seed
```

### 4. Start server

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on http://localhost:5000

## API Endpoints

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| POST   | /api/auth/register          | Register user      |
| POST   | /api/auth/login             | Login              |
| GET    | /api/auth/me                | Get current user   |
| GET    | /api/invoices               | List invoices      |
| POST   | /api/invoices               | Create invoice     |
| GET    | /api/invoices/:id           | Get invoice        |
| PATCH  | /api/invoices/:id/mark-paid | Record payment     |
| POST   | /api/invoices/:id/whatsapp  | Send via WhatsApp  |
| GET    | /api/invoices/:id/pdf       | Download PDF       |
| GET    | /api/customers              | List customers     |
| POST   | /api/customers              | Create customer    |
| GET    | /api/payments               | List payments      |
| GET    | /api/reports/summary        | Dashboard stats    |
| GET    | /api/reports/revenue        | Revenue chart data |
| GET    | /api/whatsapp/status        | WhatsApp status    |
| GET    | /api/whatsapp/qr            | Get QR code        |
| GET    | /api/subscriptions/plans    | List plans         |
| POST   | /api/subscriptions/initiate | Start payment      |
| POST   | /api/subscriptions/verify   | Verify Paystack    |
| GET    | /api/notifications          | Get notifications  |
| GET    | /api/admin/stats            | Admin overview     |
| GET    | /api/admin/users            | Manage users       |

## Payment Integration

**Paystack** (recommended for Nigeria):

- Set `PAYSTACK_SECRET_KEY` in .env
- Users pay via Paystack checkout
- Webhook auto-verifies on callback

**Bank Transfer:**

- Set bank details in .env
- User sends payment proof to billing@gettrackeet.com
- Admin manually verifies and activates subscription

## WhatsApp Setup

The WhatsApp integration uses `whatsapp-web.js`:

1. User visits /dashboard/whatsapp
2. A QR code is shown — they scan with WhatsApp
3. Connection persists via LocalAuth session
4. Automations trigger on invoice/payment events

## Plan Limits

| Plan       | Invoices/month |
| ---------- | -------------- |
| Free       | 3              |
| Starter    | 50             |
| Business   | Unlimited      |
| Enterprise | Unlimited      |

## Cron Jobs

- **8:00 AM** — Mark overdue invoices
- **9:00 AM** — Send WhatsApp payment reminders
- **9:00 PM** — Daily business summary (if enabled)
