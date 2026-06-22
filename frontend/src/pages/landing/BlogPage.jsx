import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, User } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const POSTS = [
  {
    slug: "how-to-get-paid-faster",
    title: "How to Get Paid Faster as a Small Business Owner in Nigeria",
    excerpt:
      "Late payments are one of the biggest challenges for Nigerian SMEs. Here are proven strategies to collect payments on time and keep your cash flow healthy.",
    author: "Trackeet Team",
    date: "May 10, 2026",
    readTime: "5 min read",
    tag: "Business Tips",
    tagColor: "bg-primary-light text-primary",
    emoji: "📊",
  },
  {
    slug: "whatsapp-for-business-invoicing",
    title: "Why WhatsApp is the Best Tool for Business Invoicing in Nigeria",
    excerpt:
      "With over 90 million WhatsApp users in Nigeria, sending invoices and payment reminders via WhatsApp is the most effective way to reach your customers.",
    author: "Trackeet Team",
    date: "May 5, 2026",
    readTime: "4 min read",
    tag: "WhatsApp",
    tagColor: "bg-success-light text-success",
    emoji: "📱",
  },
  {
    slug: "track-invoices-like-a-pro",
    title: "Track Your Invoices Like a Pro: A Guide for Lagos Business Owners",
    excerpt:
      "Losing track of who owes you money is a common problem. Learn how to set up a simple invoicing system that keeps you organized and ensures no payment slips through the cracks.",
    author: "Trackeet Team",
    date: "April 28, 2026",
    readTime: "6 min read",
    tag: "Guide",
    tagColor: "bg-warning-light text-warning",
    emoji: "📋",
  },
  {
    slug: "pos-agents-quick-record",
    title: "How POS Agents Can Use Trackeet to Record Transactions Instantly",
    excerpt:
      "POS business is booming in Nigeria. Learn how our Quick Record feature helps POS agents track every transaction in seconds, without the hassle of traditional invoicing.",
    author: "Trackeet Team",
    date: "April 20, 2026",
    readTime: "3 min read",
    tag: "POS Business",
    tagColor: "bg-purple-100 text-purple-600",
    emoji: "💳",
  },
  {
    slug: "overdue-invoices-nigeria",
    title: "5 Ways to Handle Overdue Invoices Without Losing Customers",
    excerpt:
      "Chasing payments is awkward. We share 5 professional strategies to recover overdue payments while keeping your customer relationships intact.",
    author: "Trackeet Team",
    date: "April 15, 2026",
    readTime: "5 min read",
    tag: "Business Tips",
    tagColor: "bg-primary-light text-primary",
    emoji: "⏰",
  },
  {
    slug: "crypto-payments-nigeria",
    title:
      "Accepting Crypto Payments in Nigeria: What Business Owners Need to Know",
    excerpt:
      "More Nigerian customers are paying with Bitcoin and USDT. Learn how to accept crypto payments safely and record them properly in your invoicing system.",
    author: "Trackeet Team",
    date: "April 8, 2026",
    readTime: "7 min read",
    tag: "Payments",
    tagColor: "bg-success-light text-success",
    emoji: "₿",
  },
];

export default function BlogPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const featured = POSTS[0];
  const rest = POSTS.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <Navbar scrolled={scrolled} />

      {/* Header */}
      <div className="bg-white dark:bg-surface border-b border-dark-200 dark:border-gray-700 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-black text-dark dark:text-white">
            Trackeet <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-dark-400 mt-2">
            Business tips, guides and updates for Nigerian entrepreneurs
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Featured post */}
        <div className="card mb-8 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="bg-gradient-to-br from-primary to-purple-700 h-48 rounded-xl mb-6 flex items-center justify-center">
            <p className="text-white text-6xl">{featured.emoji}</p>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${featured.tagColor}`}
            >
              {featured.tag}
            </span>
            <span className="text-xs text-dark-400">Featured</span>
          </div>
          <h2 className="text-xl font-black text-dark dark:text-white mb-2 group-hover:text-primary transition-colors">
            {featured.title}
          </h2>
          <p className="text-dark-400 text-sm mb-4">{featured.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-dark-400">
              <span className="flex items-center gap-1">
                <User size={12} /> {featured.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {featured.readTime}
              </span>
              <span>{featured.date}</span>
            </div>
            <span className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
              Read more <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {rest.map((post, i) => (
            <div
              key={i}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 h-32 rounded-xl mb-4 flex items-center justify-center">
                <p className="text-4xl">{post.emoji}</p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${post.tagColor}`}
              >
                {post.tag}
              </span>
              <h3 className="text-sm font-bold text-dark dark:text-white mt-2 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs text-dark-400 mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-dark-400">
                <span className="flex items-center gap-1">
                  <Clock size={10} /> {post.readTime}
                </span>
                <span>{post.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="card bg-gradient-to-br from-primary to-purple-700 text-white text-center">
          <h2 className="text-2xl font-black mb-2">Stay in the loop 📬</h2>
          <p className="text-white/80 mb-6">
            Get business tips and Trackeet updates delivered to your inbox
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-dark text-sm outline-none"
            />
            <button className="px-5 py-3 bg-white text-primary font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
