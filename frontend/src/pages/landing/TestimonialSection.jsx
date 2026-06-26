import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Section, fade } from "./animations.jsx";
import { TESTIMONIALS } from "./landingData.js";
import { useQuery } from "@tanstack/react-query";
import { publicFeedbackAPI } from "../../services/api.js";

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const avatarColors = [
  "bg-primary text-white",
  "bg-success text-white",
  "bg-warning text-white",
  "bg-purple-500 text-white",
  "bg-pink-500 text-white",
];

export default function TestimonialsSection() {
  const { data } = useQuery({
    queryKey: ["public-feedback"],
    queryFn: () => publicFeedbackAPI.getPublic().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const realFeedback = data?.feedback || [];
  const useReal = realFeedback.length >= 3;

  return (
    <section className="py-20 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section>
          <motion.div variants={fade} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mb-4">
              Thousands of businesses{" "}
              <span className="gradient-text">trust Trackeet</span>
            </h2>
            <p className="text-dark-500 dark:text-gray-400">
              Real stories from real Nigerian business owners
            </p>
          </motion.div>

          {/* Business type image grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {[
              {
                src: "/images/store1.jpg",
                label: "Fashion & Retail",
                emoji: "👗",
              },
              {
                src: "/images/eating.jpg",
                label: "Food & Catering",
                emoji: "🍔",
              },
              {
                src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=80",
                label: "Beauty & Salon",
                emoji: "💅",
              },
              {
                src: "/images/gadget.jpg",
                label: "Electronics",
                emoji: "📱",
              },
            ].map((img, i) => (
              <div
                key={i}
                className="relative h-32 rounded-2xl overflow-hidden group"
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <span className="text-sm">{img.emoji}</span>
                  <p className="text-white text-xs font-semibold">
                    {img.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {useReal ? (
            // Real feedback from DB
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realFeedback.map((f, i) => (
                <motion.div
                  key={f._id}
                  variants={fade}
                  className="card hover:shadow-glow-sm transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={
                          s <= f.rating
                            ? "text-warning fill-warning"
                            : "text-dark-200"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed flex-1 mb-4">
                    "{f.message || "Great platform for managing my business!"}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-dark-200 dark:border-gray-700">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}
                    >
                      {getInitials(`${f.user?.firstName} ${f.user?.lastName}`)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-dark dark:text-white truncate">
                        {f.user?.firstName} {f.user?.lastName}
                      </p>
                      <p className="text-xs text-dark-400 truncate capitalize">
                        {f.user?.businessCategory ||
                          f.category ||
                          "Business Owner"}
                      </p>
                    </div>
                    <div className="bg-primary-light text-primary text-xs font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0">
                      {f.category}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Fallback to hardcoded testimonials
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fade}
                  className="card hover:shadow-glow-sm transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array(t.stars)
                      .fill(0)
                      .map((_, j) => (
                        <Star
                          key={j}
                          size={16}
                          className="text-warning fill-warning"
                        />
                      ))}
                  </div>
                  <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed flex-1 mb-4">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-dark-200 dark:border-gray-700">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-dark dark:text-white">
                        {t.name}
                      </p>
                      <p className="text-xs text-dark-400">{t.role}</p>
                    </div>
                    <div className="bg-primary-light text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                      {t.amount}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </section>
  );
}
