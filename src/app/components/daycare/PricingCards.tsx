import { motion } from 'motion/react';
import { Check, Star, Sparkles } from 'lucide-react';

export default function PricingCards() {
  const pricingPlans = [
    {
      id: 'auc-staff',
      name: 'AUC Staff',
      icon: '👨‍🏫',
      badge: 'Campus Community',
      gradient: 'from-mint-400 to-teal-500',
      bgGradient: 'from-mint-50 to-teal-50',
      description: 'Special rates for AUC community',
      registrationFee: '2,000',
      monthlyTuition: '6,800',
      lateSchool: '750',
      features: [
        'Full EYFS Curriculum',
        'Fresh Daily Meals',
        'Small Class Sizes',
        'Daily Progress Updates',
        'Parent-Teacher Meetings',
        'On-Campus Convenience'
      ],
      popular: false
    },
    {
      id: 'non-auc',
      name: 'Non-AUC',
      icon: '👪',
      badge: 'All Families Welcome',
      gradient: 'from-peach-400 to-coral-500',
      bgGradient: 'from-peach-50 to-coral-50',
      description: 'Standard enrollment rates',
      registrationFee: '2,500',
      monthlyTuition: '9,500',
      lateSchool: '1,500',
      features: [
        'Full EYFS Curriculum',
        'Fresh Daily Meals',
        'Small Class Sizes',
        'Daily Progress Updates',
        'Parent-Teacher Meetings',
        'Premium Daycare Experience'
      ],
      popular: true
    }
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lemon-100 text-lemon-700 text-sm mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold">Transparent Pricing</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
        >
          Simple, Fair Pricing
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Quality early education with no hidden fees. Choose the plan that works for your family.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border-2 ${
              plan.popular ? 'border-peach-300' : 'border-mint-200'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-0 right-0 z-10">
                <div className="bg-gradient-to-r from-peach-400 to-coral-500 text-white px-4 py-2 rounded-bl-2xl rounded-tr-2xl text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  MOST POPULAR
                </div>
              </div>
            )}

            {/* Decorative Background */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${plan.gradient} opacity-10 rounded-full -translate-y-32 translate-x-32`}></div>

            <div className="relative p-8">
              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                  {plan.icon}
                </div>
                <div>
                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${plan.bgGradient} text-xs font-bold mb-2`}>
                    {plan.badge}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6 p-6 bg-gradient-to-br from-peach-50/50 via-lemon-50/50 to-mint-50/50 rounded-2xl space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-600 min-w-[110px]">Registration Fee</span>
                  <div className="flex-1 border-b-2 border-dotted border-gray-300"></div>
                  <div className="text-xl font-bold text-gray-900">
                    {plan.registrationFee} EGP
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-600 min-w-[110px]">Monthly Tuition</span>
                  <div className="flex-1 border-b-2 border-dotted border-gray-300"></div>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-peach-500 to-coral-600">
                    {plan.monthlyTuition} EGP
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-600 min-w-[110px]">Late School <span className="text-xs">(4-5 PM)</span></span>
                  <div className="flex-1 border-b-2 border-dotted border-gray-300"></div>
                  <div className="text-lg font-bold text-gray-700">
                    {plan.lateSchool} EGP
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.a
                href="/daycare/contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`block w-full py-4 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white text-center font-bold shadow-lg hover:shadow-xl transition-all`}
              >
                Book a Tour 🎉
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-lavender-50 via-peach-50 to-mint-50 rounded-3xl p-8 border border-lavender-200">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">💡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Good to Know</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">🗓️</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">Operating Hours</div>
              <div className="text-xs text-gray-600">Sunday - Thursday<br />8:15 AM - 4:00 PM</div>
            </div>
            <div>
              <div className="text-2xl mb-2">🎒</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">What's Included</div>
              <div className="text-xs text-gray-600">Meals, snacks, materials,<br />and all activities</div>
            </div>
            <div>
              <div className="text-2xl mb-2">📞</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">Payment Plans</div>
              <div className="text-xs text-gray-600">Flexible options available<br />Contact us to discuss</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-xs text-center text-gray-500 mt-8"
      >
        * All fees are in Egyptian Pounds (EGP). Registration fee is one-time only. Late School is optional (4-5 PM). Fees subject to change. Contact us for the most current information.
      </motion.p>
    </div>
  );
}