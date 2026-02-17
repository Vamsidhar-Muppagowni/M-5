
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PriceChart from '../components/PriceChart';
import { TrendingUp, MapPin, AlertTriangle, Truck, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../config';

const PriceHelp = () => {
  const [activeTab, setActiveTab] = useState('prices');
  const [location, setLocation] = useState('All');
  const { t } = useLanguage();

  // Mock Data for Prices
  const priceData = [
    { label: 'Jan', value: 2200 },
    { label: 'Feb', value: 2400 },
    { label: 'Mar', value: 2100 },
    { label: 'Apr', value: 2800 },
    { label: 'May', value: 2600 },
    { label: 'Jun', value: 3000 },
  ];

  const marketData = [
    { crop: 'Onion', market: 'Hyderabad', price: 2500, trend: 'Up', suggestion: 'Sell Now' },
    { crop: 'Tomato', market: 'Guntur', price: 1800, trend: 'Down', suggestion: 'Wait' },
    { crop: 'Cotton', market: 'Warangal', price: 5500, trend: 'Stable', suggestion: 'Hold' },
    { crop: 'Chilli', market: 'Guntur', price: 12000, trend: 'Up', suggestion: 'Sell Now' },
  ];

  // Mock Data for Buyers/Delivery
  const buyers = [
    { name: 'Fresh Mart', distance: '5 km', price: 2550 },
    { name: 'City Mandi', distance: '12 km', price: 2600 },
    { name: 'Organic Foods', distance: '25 km', price: 2800 },
  ];

  const filteredMarketData = location === 'All'
    ? marketData
    : marketData.filter(d => d.market === location);

  // SMS Simulator Logic
  const [smsInput, setSmsInput] = useState('');
  const [smsLog, setSmsLog] = useState([]);

  const handleSendSms = async () => {
    if (!smsInput) return;

    // Add user message to log
    const userMsg = { sender: 'You', text: smsInput, time: new Date().toLocaleTimeString() };
    setSmsLog(prev => [...prev, userMsg]);

    try {
      const res = await fetch('http://localhost:5000/api/sms/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: '+919876543210', message: smsInput })
      });
      const data = await res.json();

      // Add server reply to log
      const serverMsg = { sender: 'System', text: data.reply, time: new Date().toLocaleTimeString() };
      setSmsLog(prev => [...prev, serverMsg]);
    } catch (err) {
      console.error("SMS Error", err);
    }
    setSmsInput('');
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('prices')}
          className={`pb-2 px-4 font-semibold transition-colors ${activeTab === 'prices' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Market Prices & Insights
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`pb-2 px-4 font-semibold transition-colors ${activeTab === 'delivery' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Delivery Planning
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-2 px-4 font-semibold transition-colors ${activeTab === 'insights' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          AI Market Insights (ML)
        </button>
      </div>

      {activeTab === 'prices' && (
        <div className="space-y-6 animate-slide-up">
          {/* Filters & Alerts */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
              <MapPin className="text-gray-400 w-5 h-5" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent outline-none text-gray-700 font-medium"
              >
                <option value="All">All Markets</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Guntur">Guntur</option>
                <option value="Warangal">Warangal</option>
              </select>
            </div>
            <Button variant="outline" className="flex items-center gap-2 text-amber-600 border-amber-200 bg-amber-50">
              <AlertTriangle className="w-4 h-4" /> Set Price Alert
            </Button>
          </div>

          {/* Chart Section */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-600 w-5 h-5" /> Price History (Last 6 Months)
            </h3>
            <PriceChart data={priceData} />
          </Card>

          {/* Insights Table */}
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Crop</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Market</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Current Price</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Trend</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Advice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMarketData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{row.crop}</td>
                    <td className="py-3 px-4 text-gray-600">{row.market}</td>
                    <td className="py-3 px-4 text-gray-600">₹{row.price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.trend === 'Up' ? 'bg-green-100 text-green-700' :
                        row.trend === 'Down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {row.trend}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold text-sm ${row.suggestion === 'Sell Now' ? 'text-emerald-600' :
                        row.suggestion === 'Wait' ? 'text-amber-600' : 'text-gray-500'
                        }`}>
                        {row.suggestion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="space-y-6 animate-slide-up">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Truck className="text-emerald-600 w-5 h-5" /> Nearby Buyers
            </h3>
            <div className="space-y-4">
              {buyers.map((buyer, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-center p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                  <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <h4 className="font-bold text-gray-800">{buyer.name}</h4>
                    <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3 h-3" /> {buyer.distance} away
                    </p>
                  </div>
                  <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-2">
                    <div className="text-emerald-600 font-bold text-lg">Buying Price: ₹{buyer.price}</div>
                    <Button size="sm" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Schedule Pickup
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-100">
            <h4 className="font-bold text-blue-800 mb-2">Delivery Status Tracking</h4>
            <div className="flex items-center justify-between relative mt-8">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>

              {/* Steps */}
              {['Order Placed', 'Pickup Scheduled', 'In Transit', 'Completed'].map((step, idx) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${idx <= 1 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs font-semibold ${idx <= 1 ? 'text-blue-700' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6 animate-slide-up">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-purple-600 w-5 h-5" /> AI Price Predictions (Random Forest Model)
            </h3>
            <p className="text-gray-600 mb-6">
              Our Machine Learning model analyzes historical data, rainfall patterns, and seasonal yields to predict future crop prices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-center mb-2 text-gray-700">Price Trends by Crop</h4>
                <img src="/assets/graphs/price_trends.png" alt="Price Trends" className="w-full rounded-lg shadow-sm" />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-center mb-2 text-gray-700">Prediction Accuracy</h4>
                <img src="/assets/graphs/prediction_scatter.png" alt="Prediction Accuracy" className="w-full rounded-lg shadow-sm" />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2 max-w-2xl mx-auto">
                <h4 className="font-bold text-center mb-2 text-gray-700">Feature Correlation Heatmap</h4>
                <img src="/assets/graphs/correlation_heatmap.png" alt="Correlation Heatmap" className="w-full rounded-lg shadow-sm" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SMS Simulator Feature */}
      <Card className="p-6 border-t-4 border-emerald-500 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          📱 SMS Service Simulator
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Test the SMS features (Submodule 1.3). Try sending "PRICE RICE" or "HELP".
        </p>

        <div className="bg-gray-100 p-4 rounded-xl h-48 overflow-y-auto mb-4 flex flex-col gap-2">
          {smsLog.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">No messages yet...</p>}
          {smsLog.map((msg, i) => (
            <div key={i} className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'You' ? 'bg-emerald-100 self-end text-emerald-900' : 'bg-white self-start text-gray-800 border border-gray-200 shadow-sm'
              }`}>
              <p className="font-bold text-xs opacity-70 mb-1">{msg.sender} • {msg.time}</p>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            placeholder="Type SMS command (e.g. PRICE ONION)..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleSendSms()}
          />
          <Button onClick={handleSendSms} variant="primary">Send SMS</Button>
        </div>
      </Card>
    </div>
  );
};

export default PriceHelp;
