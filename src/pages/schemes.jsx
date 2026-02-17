import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Wizard from '../components/ui/Wizard';
import { BookOpen, CheckCircle, Bell } from 'lucide-react';

// Application Steps Components
const PersonalDetails = () => (
  <div className="space-y-4">
    <h4 className="font-semibold text-gray-700">Verified Personal Details</h4>
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p><strong>Name:</strong> Ravi Kumar</p>
      <p><strong>Aadhaar:</strong> XXXX-XXXX-1234</p>
      <p><strong>Mobile:</strong> +91 9876543210</p>
    </div>
    <p className="text-sm text-gray-500">Details fetched from profile.</p>
  </div>
);

const LandDetails = () => (
  <div className="space-y-4">
    <label className="block text-sm font-medium text-gray-700">Survey Number</label>
    <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 123/A" />
    <label className="block text-sm font-medium text-gray-700">Land Area (Acres)</label>
    <input type="number" className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 2.5" />
  </div>
);

const BankDetails = () => (
  <div className="space-y-4">
    <label className="block text-sm font-medium text-gray-700">Account Number</label>
    <input type="password" className="w-full px-4 py-2 border rounded-lg" placeholder="XXXX-XXXX-XXXX" />
    <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
    <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="SBIN0001234" />
  </div>
);

const Schemes = () => {
  const [applyingScheme, setApplyingScheme] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/schemes`)
      .then(res => res.json())
      .then(data => {
        setSchemes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching schemes:", err);
        setLoading(false);
      });
  }, []);

  // Fallback mock data if API fails or is empty (optional, but good for UX during dev)
  const displaySchemes = schemes.length > 0 ? schemes : [
    { id: 1, name: 'PM Kisan Samman Nidhi', desc: 'Financial support of ₹6000/year for small farmers.', status: 'Active' },
    { id: 2, name: 'Rythu Bandhu', desc: 'Investment support for agriculture and horticulture crops.', status: 'Active' },
    { id: 3, name: 'Crop Insurance Scheme', desc: 'Protection against crop loss due to natural calamities.', status: 'Active' },
  ];

  const applicationSteps = [
    { title: 'Personal Info', component: PersonalDetails },
    { title: 'Land Details', component: LandDetails },
    { title: 'Bank Info', component: BankDetails },
  ];

  const handleApply = (scheme) => {
    setApplyingScheme(scheme);
    setCompleted(false);
  };

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      setApplyingScheme(null);
      setCompleted(false);
      alert("Application Submitted Successfully!");
    }, 2000);
  };

  if (applyingScheme) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setApplyingScheme(null)}>← Back to Schemes</Button>
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Apply for {applyingScheme.name}</h2>
          {completed ? (
            <div className="text-center py-10 animate-scale-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Application Submitted!</h3>
              <p className="text-gray-500">You will receive an SMS update shortly.</p>
            </div>
          ) : (
            <Wizard steps={applicationSteps} onComplete={handleComplete} />
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <BookOpen className="text-blue-600 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Government Schemes</h1>
          </div>
          <Button variant="outline" className="flex items-center gap-2 text-blue-600 border-blue-200">
            <Bell className="w-4 h-4" /> Alerts
          </Button>
        </div>

        <p className="text-gray-600 mb-6 font-medium">Available subsidies for your region:</p>
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading schemes...</p>
          ) : (
            displaySchemes.map(scheme => (
              <div key={scheme.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {scheme.name}
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">Active</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{scheme.benefit || scheme.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">{scheme.eligibility}</p>
                </div>
                <Button onClick={() => handleApply(scheme)} variant="secondary" size="sm">
                  Apply Now
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Schemes;
