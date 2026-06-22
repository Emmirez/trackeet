import {
  FileText,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  Shield,
  Globe,
  Star,
  TrendingUp,
  ShoppingBag,
  Store,
} from "lucide-react";

export const FEATURES = [
  {
    icon: FileText,
    color: "bg-primary-light text-primary",
    title: "Smart Invoicing",
    desc: "Create professional invoices in seconds with your logo and business details. Auto-numbered, PDF ready.",
  },
  {
    icon: CreditCard,
    color: "bg-success-light text-success",
    title: "Payment Tracking",
    desc: "Know who paid and who owes you — in real time. Never lose a naira to forgotten debts again.",
  },
  {
    icon: MessageSquare,
    color: "bg-[#dcfce7] text-[#16a34a]",
    title: "WhatsApp Automation",
    desc: "Auto-send invoices, payment reminders and receipts directly to your customers on WhatsApp.",
  },
  {
    icon: Globe,
    color: "bg-purple-100 text-purple-600",
    title: "Free Online Store",
    desc: "Get your own store link at trackeet.ng/store/yourname. Customers browse, add to cart and order via WhatsApp instantly.",
  },
  {
    icon: ShoppingBag,
    color: "bg-warning-light text-warning",
    title: "WhatsApp Commerce",
    desc: "Your store connects directly to WhatsApp. No payment gateway needed — customers order and you confirm via chat.",
  },
  {
    icon: BarChart3,
    color: "bg-info-light text-info",
    title: "Business Reports",
    desc: "See your total revenue, best customers, and business growth trends in plain English.",
  },
  {
    icon: Users,
    color: "bg-danger-light text-danger",
    title: "Customer Management",
    desc: "Keep all your customer records organised. Track their history, spending and outstanding balances.",
  },
  {
    icon: Star,
    color: "bg-yellow-100 text-yellow-600",
    title: "Store Reviews",
    desc: "Customers leave reviews on your store. Build trust and social proof that converts visitors to buyers.",
  },
  {
    icon: Shield,
    color: "bg-dark/5 text-dark-400",
    title: "Bank-Grade Security",
    desc: "Your data is encrypted and protected. JWT auth, rate limiting and full audit logs built in.",
  },
  {
    icon: Store,
    color: "bg-purple-100 text-purple-600",
    title: "Free Online Store",
    desc: "Every account gets a free storefront at trackeet.ng/store/yourname. Add products with photos and customers order via WhatsApp instantly.",
  },
  {
    icon: ShoppingBag,
    color: "bg-warning-light text-warning",
    title: "WhatsApp Commerce",
    desc: "No payment gateway needed. Customers browse, add to cart and order via WhatsApp — you confirm and deliver.",
  },
];

export const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "Forever",
    badge: null,
    highlight: false,
    cta: "Get Started Free",
    ctaStyle: "btn-secondary",
    features: [
      "5 invoices per month",
      "Basic customer list",
      "PDF download",
      "Manual payment tracking",
      "Free online store",
      "Email support",
    ],
  },
  {
    name: "Starter",
    price: 2000,
    period: "per month",
    badge: "Most Popular",
    highlight: true,
    cta: "Start Starter Plan",
    ctaStyle: "btn-primary",
    features: [
      "50 invoices per month",
      "Unlimited customers",
      "WhatsApp automation",
      "Payment reminders",
      "PDF receipts",
      "Free online store",
      "Product variants & reviews",
      "Basic reports",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: 5000,
    period: "per month",
    badge: "Best Value",
    highlight: false,
    cta: "Start Business Plan",
    ctaStyle: "btn-secondary",
    features: [
      "Unlimited invoices",
      "All Starter features",
      "AI business insights",
      "WhatsApp campaigns",
      "Advanced reports",
      "Free online store",
      "Store analytics",
      "Newsletter",
      "Multi-user (3 seats)",
      "Dedicated support",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: "Custom pricing",
    badge: null,
    highlight: false,
    cta: "Contact Sales",
    ctaStyle: "btn-secondary",
    features: [
      "Everything in Business",
      "Unlimited seats",
      "Custom integrations",
      "API access",
      "Custom store domain",
      "SLA guarantee",
      "Onboarding support",
      "Custom invoice templates",
    ],
  },
];

export const TESTIMONIALS = [
  {
    name: "Renee Kelvin",
    role: "Fashion Vendor, Lagos Island",
    avatar: "/avatars/Chisom.jpg",
    stars: 5,
    amount: "₦2.3M tracked",
    text: "Before Trackeet I was using notebooks and WhatsApp screenshots. Now I send professional invoices in 30 seconds. My customers actually take me more seriously!",
  },
  {
    name: "Tunde Adeyemi",
    role: "POS Agent, Surulere",
    avatar: "/avatars/Tunde.jpg",
    stars: 5,
    amount: "₦850k saved",
    text: "The WhatsApp automation is a game changer. My customers get receipts automatically and I don't have to chase anyone for payment manually anymore.",
  },
  {
    name: "Chisom Kenneth",
    role: "Freelance Designer, Abuja",
    avatar: "/avatars/Lulu.jpg",
    stars: 5,
    amount: "45 invoices/month",
    text: "I used to forget who paid and who didn't. Trackeet shows me everything in one dashboard. The reports feature helped me realise I was undercharging!",
  },
  {
    name: "Joe Ibrahim",
    role: "Food Business Owner, Ikeja",
    avatar: "/avatars/Emeka.jpg",
    stars: 5,
    amount: "₦4.1M processed",
    text: "My customers ask me to send their invoice again via WhatsApp — now Trackeet does it automatically. I've saved at least 2 hours every day.",
  },
  {
    name: "Lulu Moses",
    role: "Catering Business, VI",
    avatar: "/avatars/Divine.jpg",
    stars: 5,
    amount: "120+ customers",
    text: "The invoice PDF looks so professional my clients think I have an accountant. The payment reminder feature alone is worth the subscription fee!",
  },
  {
    name: "Emmanuel Duke",
    role: "IT Consultant, Port Harcourt",
    avatar: "/avatars/Eze.jpg",
    stars: 5,
    amount: "₦6.8M collected",
    text: "Switched from Excel to Trackeet and never looked back. The WhatsApp integration works perfectly and my collection rate went from 60% to 95%.",
  },
];

export const STATS = [
  { value: "12K+", label: "Businesses", icon: Users },
  { value: "2.4B+", label: "Invoiced", icon: FileText },
  { value: "98%", label: "Satisfaction", icon: Star },
  { value: "36", label: "States", icon: Globe },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create your account",
    icon: Users,
    desc: "Sign up free in 60 seconds. Add your business name, logo and bank details.",
  },
  {
    step: "02",
    title: "Add your customers",
    icon: CreditCard,
    desc: "Import or manually add your customer list with their WhatsApp numbers.",
  },
  {
    step: "03",
    title: "Create & send invoices",
    icon: FileText,
    desc: "Create a professional invoice and send it directly to your customer's WhatsApp with one click.",
  },
  {
    step: "04",
    title: "Launch your online store",
    icon: Store,
    desc: "Every account gets a free storefront. Add products, share your link and customers order via WhatsApp instantly.",
  },
  {
    step: "05",
    title: "Get paid & track everything",
    icon: TrendingUp,
    desc: "Track who paid, who owes you, and receive automated reminders — all on autopilot.",
  },
];

export const FAQ = [
  {
    q: "Is Trackeet really free to start?",
    a: "Yes! Our Free plan lets you create up to 5 invoices per month with no credit card required. Perfect for trying Trackeet before committing.",
  },
  {
    q: "How does WhatsApp automation work?",
    a: "You connect your WhatsApp number via QR code scan. Trackeet then automatically sends invoices, payment confirmations and reminders to your customers via WhatsApp — no manual sending needed.",
  },
  {
    q: "How do I pay for my subscription?",
    a: "We accept Paystack (card payments), bank transfer, and Flutterwave. You can pay monthly or annually (save 20% annually).",
  },
  {
    q: "Can I use Trackeet for my team?",
    a: "Yes! The Business plan supports up to 3 seats and Enterprise supports unlimited team members. Each person has their own login.",
  },
  {
    q: "Is my financial data safe?",
    a: "Absolutely. We use bank-grade AES-256 encryption, JWT authentication, and all data is backed up daily. We never share your data with third parties.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. Your account stays active until the end of your billing period with no cancellation fees.",
  },
];

export const DEMO_CONTENT = [
  {
    title: "Create a professional invoice in 30 seconds",
    desc: "Select your customer, add items, set the due date and send. Your branded PDF is generated automatically and delivered to their WhatsApp.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
    loomId: "35fb4f7edb344eafb1628302125b8161",
    steps: [
      "Select customer from your list",
      "Add items and prices",
      "Set payment due date",
      "Send via WhatsApp or download PDF",
    ],
  },
  {
    title: "Know exactly who owes you money",
    desc: "See all your paid, pending and overdue invoices in one dashboard. Send payment reminders with one click and never lose money to forgotten debts.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    loomId: "02b748e67e744a1c923266769d6f9faf",
    steps: [
      "View all payment statuses at a glance",
      "Send automated reminders",
      "Record partial or full payments",
      "Track payment history per customer",
    ],
  },
  {
    title: "Let WhatsApp do the work for you",
    desc: "Connect your WhatsApp once. Trackeet automatically sends invoices, payment confirmations, reminders and even your daily business summary.",
    img: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&auto=format&fit=crop&q=80",
    loomId: "400a448a51754deda765b011aa9efdb8",
    steps: [
      "Scan QR code to connect WhatsApp",
      "Toggle automations on/off",
      "Customise your message templates",
      "Watch messages send themselves",
    ],
  },
  {
    title: "Your free online store — live in minutes",
    desc: "Every Trackeet account comes with a free storefront. Add products with photos, set prices, and customers order directly via WhatsApp. No payment gateway needed.",
    img: "",
    loomId: "aa0cc324006d400e9fe048b71aa136cd",
    steps: [
      "Add products with photos and prices",
      "Share your store link anywhere",
      "Customers browse, wishlist and add to cart",
      "Orders arrive on your WhatsApp instantly",
    ],
  },
];
