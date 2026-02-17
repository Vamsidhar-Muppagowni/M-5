
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Sprout, Sun, CloudRain, AlertTriangle, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../config';

const FarmingHelp = () => {
  const [activeSeason, setActiveSeason] = useState('Rabi');
  const [apiTips, setApiTips] = useState([]);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/tips`)
      .then(res => res.json())
      .then(data => setApiTips(data))
      .catch(err => console.error(err));
  }, []);

  // Helper to filter api tips by season logic if backend provided it, 
  // but backend provides 'month'. For now, mapping broadly or appending.

  // Combining local + api tips for demo
  const tips = {
    Rabi: [
      { title: 'Wheat sowing time', desc: 'Best time to sow wheat is Nov 1st to Nov 15th.' },
      { title: 'Winter Irrigation', desc: 'Ensure proper irrigation during crown root initiation.' },
      ...apiTips.filter(t => ['November', 'December', 'January'].includes(t.month)).map(t => ({ title: t.type, desc: t.message }))
    ],
    Kharif: [
      { title: 'Paddy Transplantation', desc: 'Complete transplantation before July 15th for best yield.' },
      { title: 'Pest Control', desc: 'Monitor for stem borer in early stages.' },
      ...apiTips.filter(t => ['June', 'July', 'August'].includes(t.month)).map(t => ({ title: t.type, desc: t.message }))
    ]
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      {/* Admin Warning Banner */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-red-800">Heavy Rainfall Alert</h4>
          <p className="text-red-700 text-sm">Heavy rains predicted in Guntur district for next 48 hours. Protect harvested crops.</p>
        </div>
      </div>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Sprout className="text-emerald-600 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Farming Help & Tips</h1>
        </div>

        {/* Season Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveSeason('Kharif')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${activeSeason === 'Kharif' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 hover:border-emerald-200'
              }`}
          >
            <CloudRain className="w-5 h-5" /> Kharif (Monsoon)
          </button>
          <button
            onClick={() => setActiveSeason('Rabi')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${activeSeason === 'Rabi' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-100 hover:border-amber-200'
              }`}
          >
            <Sun className="w-5 h-5" /> Rabi (Winter)
          </button>
        </div>

        <h3 className="font-bold text-gray-800 mb-4">{activeSeason} Season Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {tips[activeSeason].map((tip, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {tip.title}
              </h4>
              <p className="text-gray-600 text-sm">{tip.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-gray-800 mb-4">Crop Guides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Rice', 'Wheat', 'Cotton', 'Chilli'].map((crop) => (
            <div key={crop} className="aspect-square bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Sprout className="text-emerald-600 w-6 h-6" />
              </div>
              <span className="font-medium text-gray-700">{crop}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FarmingHelp;
