import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, PartyPopper, X as XIcon, Sun, Snowflake, Gift, Heart } from 'lucide-react';

interface CalendarEvent {
  date: string;
  title: string;
  type: 'holiday' | 'party' | 'closure' | 'special';
  description: string;
  icon: 'party' | 'sun' | 'snow' | 'gift' | 'heart' | 'close';
  color: string;
}

export default function AcademicCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const events: CalendarEvent[] = [
    {
      date: 'Jan 7, 2026',
      title: 'Coptic Christmas',
      type: 'holiday',
      description: 'Daycare closed in observance of Coptic Christmas. Regular hours resume the next day.',
      icon: 'gift',
      color: 'from-coral-400 to-pink-500'
    },
    {
      date: 'Jan 25, 2026',
      title: 'Revolution Day',
      type: 'holiday',
      description: 'National holiday - daycare closed. A great day to spend with family!',
      icon: 'heart',
      color: 'from-lavender-400 to-purple-500'
    },
    {
      date: 'Feb 14, 2026',
      title: 'Valentine\'s Day Party',
      type: 'party',
      description: 'Celebrate friendship and kindness! Children can wear red or pink. Fun activities and treats planned.',
      icon: 'heart',
      color: 'from-pink-400 to-coral-500'
    },
    {
      date: 'Mar 21, 2026',
      title: 'Mother\'s Day Celebration',
      type: 'special',
      description: 'Special celebration honoring mothers with songs, crafts, and surprises. Parents welcome to join at 11 AM!',
      icon: 'heart',
      color: 'from-peach-400 to-coral-500'
    },
    {
      date: 'Apr 18-20, 2026',
      title: 'Eid Al-Fitr Holiday',
      type: 'holiday',
      description: 'Daycare closed for Eid celebrations. Eid Mubarak to all families!',
      icon: 'gift',
      color: 'from-mint-400 to-teal-500'
    },
    {
      date: 'Apr 25, 2026',
      title: 'Sinai Liberation Day',
      type: 'holiday',
      description: 'National holiday - daycare closed.',
      icon: 'heart',
      color: 'from-lavender-400 to-purple-500'
    },
    {
      date: 'May 1, 2026',
      title: 'Labour Day',
      type: 'holiday',
      description: 'National holiday - daycare closed.',
      icon: 'sun',
      color: 'from-lemon-400 to-yellow-500'
    },
    {
      date: 'May 15, 2026',
      title: 'Spring Festival',
      type: 'party',
      description: 'Outdoor celebration with games, face painting, and spring activities. Wear comfortable clothes for outdoor play!',
      icon: 'sun',
      color: 'from-mint-400 to-green-500'
    },
    {
      date: 'Jun 15-19, 2026',
      title: 'Summer Camp Starts',
      type: 'special',
      description: 'Summer camp program begins! Fun-filled weeks with outdoor activities, arts & crafts, and seasonal fun.',
      icon: 'sun',
      color: 'from-lemon-400 to-orange-500'
    },
    {
      date: 'Jun 25-27, 2026',
      title: 'Eid Al-Adha Holiday',
      type: 'holiday',
      description: 'Daycare closed for Eid celebrations. Eid Mubarak!',
      icon: 'gift',
      color: 'from-mint-400 to-teal-500'
    },
    {
      date: 'Jul 23, 2026',
      title: 'Revolution Day',
      type: 'holiday',
      description: 'National holiday - daycare closed.',
      icon: 'heart',
      color: 'from-lavender-400 to-purple-500'
    },
    {
      date: 'Oct 6, 2026',
      title: 'Armed Forces Day',
      type: 'holiday',
      description: 'National holiday - daycare closed.',
      icon: 'heart',
      color: 'from-lavender-400 to-purple-500'
    },
    {
      date: 'Oct 31, 2026',
      title: 'Halloween Party',
      type: 'party',
      description: 'Dress up in fun costumes! Age-appropriate activities, treats, and spooky (but not scary) fun for all.',
      icon: 'party',
      color: 'from-peach-400 to-coral-500'
    },
    {
      date: 'Dec 15-19, 2026',
      title: 'Winter Camp Week',
      type: 'special',
      description: 'Winter-themed activities, indoor games, crafts, and warm treats. Registration opens in November.',
      icon: 'snow',
      color: 'from-sky-400 to-blue-500'
    },
    {
      date: 'Dec 20, 2026',
      title: 'Winter Celebration',
      type: 'party',
      description: 'End-of-year celebration with songs, performances, and treats. Parents invited to join the festivities at 11 AM!',
      icon: 'snow',
      color: 'from-sky-400 to-purple-500'
    },
    {
      date: 'Dec 25, 2026',
      title: 'Christmas Holiday',
      type: 'holiday',
      description: 'Daycare closed for Christmas. Wishing all families a joyful holiday!',
      icon: 'gift',
      color: 'from-coral-400 to-pink-500'
    }
  ];

  const getIcon = (iconType: CalendarEvent['icon']) => {
    switch (iconType) {
      case 'party': return <PartyPopper className="w-5 h-5" />;
      case 'sun': return <Sun className="w-5 h-5" />;
      case 'snow': return <Snowflake className="w-5 h-5" />;
      case 'gift': return <Gift className="w-5 h-5" />;
      case 'heart': return <Heart className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'holiday': return 'Holiday';
      case 'party': return 'Party';
      case 'closure': return 'Closed';
      case 'special': return 'Special Event';
    }
  };

  const months = ['all', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const filteredEvents = selectedMonth === 'all' 
    ? events 
    : events.filter(event => event.date.startsWith(selectedMonth));

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-sm mb-4"
        >
          <Calendar className="w-4 h-4" />
          <span>2026 Events</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
        >
          Academic Calendar
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Mark your calendar for holidays, parties, and special events
        </motion.p>
      </div>

      {/* Month Filter */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-2 justify-center min-w-max px-4">
          {months.map((month) => (
            <motion.button
              key={month}
              onClick={() => setSelectedMonth(month)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedMonth === month
                  ? 'bg-gradient-to-r from-peach-400 to-coral-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-peach-300'
              }`}
            >
              {month === 'all' ? 'All Months' : month}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event, index) => (
            <motion.button
              key={event.date + event.title}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              onClick={() => setSelectedEvent(event)}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl p-5 text-left bg-white border-2 border-gray-200 hover:border-peach-300 hover:shadow-xl transition-all group"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${event.color} text-white`}>
                    {getIcon(event.icon)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-br ${event.color} text-white`}>
                    {getTypeLabel(event.type)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-1">{event.date}</div>
                <h3 className="font-bold text-gray-900 mb-2 leading-tight">{event.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${selectedEvent.color} opacity-20 rounded-full -translate-y-32 translate-x-32`}></div>
              
              <div className="relative z-10">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <XIcon className="w-4 h-4 text-gray-600" />
                </button>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedEvent.color} flex items-center justify-center text-white mb-4`}>
                  {getIcon(selectedEvent.icon)}
                </div>

                {/* Content */}
                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-br ${selectedEvent.color} text-white text-xs font-semibold mb-3`}>
                  {getTypeLabel(selectedEvent.type)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                <div className="text-sm text-gray-500 mb-4">{selectedEvent.date}</div>
                <p className="text-gray-700 leading-relaxed mb-6">{selectedEvent.description}</p>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`w-full py-3 rounded-2xl bg-gradient-to-r ${selectedEvent.color} text-white font-semibold hover:shadow-lg transition-all`}
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
