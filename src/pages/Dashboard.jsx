import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeather, getWeatherDescription } from '../services/WeatherService';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  Sprout,
  CreditCard,
  BookOpen,
  TrendingUp,
  CloudSun,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const data = await getWeather(latitude, longitude);
        if (data) setWeather(data);
      }, (error) => {
        console.error("Location access denied or error:", error);
      });
    }
  }, []);

  const quickActions = [
    {
      title: t('add_crop'),
      icon: Sprout,
      path: '/add-crop',
      color: 'bg-emerald-100 text-emerald-600',
      description: "Log your new harvest",
      roles: ['farmer', 'admin']
    },
    {
      title: t('price_help'),
      icon: TrendingUp,
      path: '/price-help',
      color: 'bg-amber-100 text-amber-600',
      description: "Check market trends",
      roles: ['farmer', 'admin']
    },
    {
      title: t('schemes'),
      icon: BookOpen,
      path: '/schemes',
      color: 'bg-blue-100 text-blue-600',
      description: "Government subsidies",
      roles: ['farmer', 'admin']
    },
    {
      title: t('payments'),
      icon: CreditCard,
      path: '/payments',
      color: 'bg-purple-100 text-purple-600',
      description: "View history",
      roles: ['farmer', 'admin']
    },
  ];

  const visibleActions = quickActions.filter(action => action.roles.includes(user?.role));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sprout size={200} />
        </div>
        <div className="relative p-8 md:p-12 z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('project_title')}</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mb-8">
            {t('project_desc')}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm p-4 rounded-xl min-w-[200px]">
              <CloudSun className="text-amber-300" size={32} />
              <div>
                <div className="text-sm text-emerald-100">{t('todays_weather')}</div>
                <div className="font-semibold text-xl">
                  {weather ? (
                    <div className="flex flex-col">
                      <span>{weather.temp}°C, {t(getWeatherDescription(weather.code))}</span>
                      <span className="text-sm text-emerald-100 opacity-90">{weather.location}</span>
                    </div>
                  ) : t('locating')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <TrendingUp className="text-emerald-300" size={32} />
              <div>
                <div className="text-sm text-emerald-100">{t('market_trend')}</div>
                <div className="font-semibold text-xl">{t('growth_mock')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          {t('quick_actions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleActions.map((action, index) => (
            <Link to={action.path} key={index} className="group">
              <Card hoverEffect className="h-full p-6 flex flex-col justify-between border-t-4 border-t-transparent hover:border-t-emerald-500">
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${action.color} transition-transform group-hover:scale-110`}>
                    <action.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-emerald-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{action.description}</p>
                </div>
                <div className="flex items-center text-sm font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                  {t('access_now')} <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Updates / Marketplace Teaser */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Featured Crops</h2>
              <Link to="/marketplace" className="text-emerald-600 font-medium hover:underline">{t('view_marketplace')}</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mock Data */}
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-800">Organic Tomato</h4>
                    <p className="text-green-600 font-bold">₹40/kg</p>
                    <p className="text-xs text-gray-500 mt-1">Available: 500kg</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 h-full bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ArrowRight className="bg-amber-500 text-white rounded-full p-1 w-6 h-6" />
              {t('next_steps')}
            </h2>
            <ul className="space-y-4">
              {(!user?.phone || !user?.address) ? (
                <li className="flex gap-3 items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0" />
                  <p className="text-sm text-gray-700">{t('step_profile')}</p>
                </li>
              ) : (
                <li className="flex gap-3 items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-sm text-gray-700 font-medium text-emerald-700">Profile Complete! ✅</p>
                </li>
              )}
              <li className="flex gap-3 items-start">
                <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0" />
                <p className="text-sm text-gray-700">{t('step_price')}</p>
              </li>
            </ul>
            {(!user?.phone || !user?.address) ? (
              <Link to="/profile">
                <Button variant="secondary" className="w-full mt-6">{t('update_profile')}</Button>
              </Link>
            ) : (
              <Link to="/marketplace">
                <Button variant="primary" className="w-full mt-6">View Marketplace</Button>
              </Link>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
