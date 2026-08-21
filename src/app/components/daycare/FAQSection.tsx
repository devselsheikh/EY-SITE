import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  icon: string;
  tip?: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQ[] = [
    {
      question: 'What ages do you accept?',
      answer: 'We welcome children from 1 to 10 years old. Our Preschool Program serves ages 1-5, while our After-School Program caters to children up to 10 years old. We also offer Seasonal Camps for ages 4-8.',
      icon: '👶',
      tip: 'Did you know? Early Years is one of the few centers in Egypt with 25 years of EYFS experience!'
    },
    {
      question: 'What are your operating hours?',
      answer: 'We are open Sunday through Thursday from 8:15 AM to 4:00 PM. Tours can be scheduled between 10:30 AM to 12:00 PM with 1 day advance notice. We are closed on Fridays, Saturdays, and public holidays.',
      icon: '🕐',
      tip: 'Early drop-off or late pick-up? Contact us to discuss flexible arrangements!'
    },
    {
      question: 'What curriculum do you follow?',
      answer: 'We follow the UK Early Years Foundation Stage (EYFS) curriculum, which is play-based and focuses on holistic child development. Our qualified educators create engaging activities that support learning across all developmental areas.',
      icon: '📚',
      tip: 'The EYFS framework is recognized worldwide as a gold standard for early years education!'
    },
    {
      question: 'Do you provide meals?',
      answer: 'Yes! We provide freshly cooked, nutritious meals daily, prepared on-site by our kitchen staff. Menus are designed with variety and nutrition in mind, including main courses, sides, fresh fruits, and healthy snacks.',
      icon: '🍽️',
      tip: 'We accommodate dietary restrictions and allergies. Just let us know your child\'s needs!'
    },
    {
      question: 'How do I enroll my child?',
      answer: 'Start by booking a tour to visit our facility and meet our team. After your tour, you can complete the registration form and submit required documents. Our team will guide you through the settling-in process to ensure a smooth transition for your child.',
      icon: '📝',
      tip: 'Book your tour at least 1 day in advance for the best experience!'
    },
    {
      question: 'What is the student-to-teacher ratio?',
      answer: 'We maintain small group sizes to ensure personalized attention. Our ratios follow EYFS guidelines: 1:3 for children under 2, 1:4 for 2-year-olds, and 1:8 for children 3-5 years old. This ensures every child receives quality care and education.',
      icon: '👥',
      tip: 'Small class sizes mean more one-on-one time for your child to thrive!'
    },
    {
      question: 'How do you communicate with parents?',
      answer: 'We believe in strong parent partnerships! You\'ll receive daily updates about your child\'s activities, meals, and progress. We also hold regular parent-teacher meetings and share photos/videos of special moments and learning milestones.',
      icon: '💬',
      tip: 'Stay connected through our parent communication app for real-time updates!'
    },
    {
      question: 'Is the facility safe and secure?',
      answer: 'Absolutely. Safety is our top priority. Our facility features secure entry systems, CCTV monitoring, child-safe furniture and equipment, regular safety drills, and trained staff with first aid certification. We maintain strict pick-up/drop-off protocols.',
      icon: '🔒',
      tip: 'All visitors must check in at reception - your child\'s safety comes first!'
    }
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-100 text-lavender-700 text-sm mb-4"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Common Questions</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Everything parents want to know about Early Years Daycare
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <motion.button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`w-full text-left p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                  isOpen
                    ? 'border-peach-300 bg-gradient-to-br from-peach-50 to-lemon-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-peach-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0 mt-1">{faq.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-bold text-gray-900 text-lg pr-4">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-peach-600' : 'text-gray-400'}`} />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <div className="mt-4 pl-14 pr-8 space-y-3">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        {faq.tip && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-start gap-2 p-3 bg-white/80 rounded-xl border border-peach-200"
                          >
                            <Sparkles className="w-4 h-4 text-peach-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-semibold text-peach-700 mb-1">Did You Know?</div>
                              <div className="text-sm text-gray-600">{faq.tip}</div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <p className="text-gray-600 mb-4">Still have questions?</p>
        <motion.a
          href="/daycare/contact"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-peach-400 via-coral-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Contact Us
          <ArrowRight className="w-5 h-5" />
        </motion.a>
      </motion.div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}