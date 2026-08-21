import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { isPublished } from '../../data/cms';
import { useCMS } from '../../hooks/useCMS';
import ManagedImage from '../ManagedImage';
import { TESTIMONIAL_KEYS } from '../../data/assetManifest';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  highlight: string;
}

export default function Testimonials() {
  const cms = useCMS();
  const cmsData = useMemo(() => {
    const active = cms.testimonials.filter(isPublished).sort((a, b) => a.displayOrder - b.displayOrder);
    if (active.length > 0) return active.map(t => ({ name: t.name, role: t.role, avatar: t.avatar, rating: t.rating, quote: t.quote, highlight: t.highlight }));
    return null;
  }, [cms.testimonials]);

  const testimonials: Testimonial[] = cmsData || [
    {
      name: 'Sarah Mohamed',
      role: 'Parent of Layla, Age 4',
      avatar: 'https://images.unsplash.com/photo-1628676348963-f88c671333f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
      rating: 5,
      quote: "Early Years has been a blessing for our family. Layla loves going to daycare every morning! The teachers are so caring and the EYFS curriculum has really helped her development. We see progress every week.",
      highlight: 'Amazing staff and curriculum'
    },
    {
      name: 'Ahmed Hassan',
      role: 'AUC Staff, Parent of twins',
      avatar: 'https://images.unsplash.com/photo-1685580388390-576100ae9ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
      rating: 5,
      quote: "As AUC staff, having the daycare on campus is incredibly convenient. The twins are safe, happy, and learning so much. The daily updates give us peace of mind, and the meals are always nutritious and fresh.",
      highlight: 'Convenient and trustworthy'
    },
    {
      name: 'Noha Ibrahim',
      role: 'Parent of Omar, Age 3',
      avatar: 'https://images.unsplash.com/photo-1624272864537-8ecc72b67958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
      rating: 5,
      quote: "Omar started at Early Years when he was 2, and the transformation has been incredible. He's more confident, social, and curious. The play-based learning approach works wonders. I recommend it to all my friends!",
      highlight: 'Incredible transformation'
    },
    {
      name: 'Karim Ali',
      role: 'Parent of Malak, Age 5',
      avatar: 'https://images.unsplash.com/photo-1774641374101-0c5a243b7e7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
      rating: 5,
      quote: "The professionalism and warmth of the Early Years team is unmatched. Malak has been attending for 3 years and is now fully ready for school. The 25 years of experience really shows in everything they do.",
      highlight: 'Professional and warm'
    },
    {
      name: 'Dina Youssef',
      role: 'Parent of twins, Ages 6 & 8',
      avatar: 'https://images.unsplash.com/photo-1567680148642-ac49a46543d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
      rating: 5,
      quote: "The After-School program has been a lifesaver! The kids get homework help, creative activities, and healthy meals. They come home happy and we have peace of mind knowing they're in great hands.",
      highlight: 'Perfect after-school care'
    },
    {
      name: 'Hossam Farid',
      role: 'Parent of Jana, Age 4',
      avatar: 'https://images.unsplash.com/photo-1564429238817-393bd4286b2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
      rating: 5,
      quote: "From the moment we toured the facility, we knew this was the right place. The classrooms are bright and engaging, the outdoor play area is amazing, and most importantly, Jana absolutely loves her teachers.",
      highlight: 'Perfect environment for learning'
    }
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-peach-100 text-peach-700 text-sm mb-4"
        >
          <Star className="w-4 h-4 fill-current" />
          <span>Parent Reviews</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
        >
          Loved by Families
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Hear what parents say about their experience with Early Years
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden group"
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-peach-100 to-mint-100 rounded-full opacity-50 -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-peach-400 to-coral-500 flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-lemon-400 fill-current" />
                ))}
              </div>

              {/* Highlight */}
              <div className="inline-block px-3 py-1 rounded-full bg-mint-100 text-mint-700 text-xs font-semibold mb-3">
                {testimonial.highlight}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <ManagedImage
                  assetKey={TESTIMONIAL_KEYS[testimonial.name]}
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-peach-100"
                />
                <div>
                  <div className="font-bold text-gray-900 text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 p-8 bg-gradient-to-br from-peach-100 via-lemon-50 to-mint-100 rounded-3xl"
      >
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">98%</div>
            <div className="text-sm text-gray-600">Parent Satisfaction</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">200+</div>
            <div className="text-sm text-gray-600">Happy Families</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">4.9/5</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
