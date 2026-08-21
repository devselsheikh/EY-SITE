import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, UtensilsCrossed, Award } from 'lucide-react';

interface DayMenu {
  day: string;
  meal: string;
  icon: string;
}

interface WeekMenu {
  week: string;
  menus: DayMenu[];
}

export default function LunchMenu() {
  const [currentWeek, setCurrentWeek] = useState(0);

  const weeklyMenus: WeekMenu[] = [
    {
      week: 'Week 1',
      menus: [
        { day: 'Sunday', meal: 'Koshari & Salad', icon: '🍚' },
        { day: 'Monday', meal: 'Molokhia, Rice, Chicken, and Salad', icon: '🍗' },
        { day: 'Tuesday', meal: 'Chicken Shawarma, Rice, and Yoghurt Salad', icon: '🌯' },
        { day: 'Wednesday', meal: 'Mesa2a3a with Minced Meat and Rice, and Salad', icon: '🥘' },
        { day: 'Thursday', meal: 'Pasta Bolognese and Salad', icon: '🍝' }
      ]
    },
    {
      week: 'Week 2',
      menus: [
        { day: 'Sunday', meal: 'Summer: Veggie Pasta | Winter: Lentil Soup with Croutons', icon: '🥣' },
        { day: 'Monday', meal: 'Seasonal Veg in Red Sauce, Minced Meat, White Rice and Salad', icon: '🍛' },
        { day: 'Tuesday', meal: 'Yellow Rice with Chicken and White Sauce, Salad', icon: '🍗' },
        { day: 'Wednesday', meal: 'Molokhia, Rice, Chicken, and Salad', icon: '🥗' },
        { day: 'Thursday', meal: 'Margarita Pizza', icon: '🍕' }
      ]
    }
  ];

  const currentMenu = weeklyMenus[currentWeek];

  const nextWeek = () => {
    setCurrentWeek((prev) => (prev + 1) % weeklyMenus.length);
  };

  const prevWeek = () => {
    setCurrentWeek((prev) => (prev - 1 + weeklyMenus.length) % weeklyMenus.length);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-mint-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-mint-100 via-lemon-50 to-peach-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-mint-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Daycare Lunch Menu</h3>
              <p className="text-sm text-gray-600">Fresh, nutritious meals daily</p>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-2xl p-3">
          <motion.button
            onClick={prevWeek}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
          
          <div className="text-center">
            <div className="font-bold text-gray-900">{currentMenu.week}</div>
          </div>

          <motion.button
            onClick={nextWeek}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </motion.button>
        </div>
      </div>

      {/* Menu Table */}
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWeek}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {currentMenu.menus.map((menu, index) => (
              <motion.div
                key={menu.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="bg-gradient-to-r from-mint-50/50 to-lemon-50/50 rounded-2xl p-5 border-2 border-mint-100 hover:border-mint-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{menu.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 mb-1">{menu.day}</div>
                    <div className="text-sm text-gray-700 leading-relaxed">{menu.meal}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Menu Credit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-gradient-to-br from-lavender-50 via-peach-50 to-mint-50 rounded-2xl border border-lavender-200"
        >
          <div className="flex items-center gap-3 justify-center text-center">
            <Award className="w-8 h-8 text-peach-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-gray-900">Menu Developed By:</div>
              <div className="text-sm text-gray-700 font-semibold">Dr. Lobna Mourad</div>
              <div className="text-xs text-gray-600">Assistant Professor of Biology and Human Nutrition</div>
            </div>
          </div>
        </motion.div>

        {/* Note */}
        <div className="mt-6 p-4 bg-gradient-to-r from-peach-50 to-mint-50 rounded-2xl">
          <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span>🥗</span>
              <span>Fresh daily salads</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🍽️</span>
              <span>Cooked on-site</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌱</span>
              <span>Nutritionally balanced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
