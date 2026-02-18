
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Payments = () => {
  const [balance, setBalance] = useState(12500);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Fetching payments for farmerId 101
    fetch(`${API_BASE_URL}/api/payments/101`)
      .then(res => res.json())
      .then(data => {
        // Formatting backend data to match UI structure if needed, or using directly
        // Backend sends: { farmerId, amount, status, date }
        // UI expects: { id, type, from, amount, date, status }
        const formattedTx = data.map((tx, index) => ({
          id: index,
          type: tx.status === 'Paid' ? 'Paid' : 'Received',
          from: 'Government/Market',
          amount: tx.amount,
          date: tx.date,
          status: tx.status
        }));
        // Merging with some local mocks if empty to show something
        setTransactions(formattedTx.length ? formattedTx : [
          { id: 1, type: 'Received', from: 'Fresh Mart', amount: 4500, date: '15 Jan 2024', status: 'Completed' },
          { id: 2, type: 'Received', from: 'Ravi Traders', amount: 2100, date: '12 Jan 2024', status: 'Completed' },
        ]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching payments:", err);
        // Fallback
        setTransactions([
          { id: 1, type: 'Received', from: 'Fresh Mart', amount: 4500, date: '15 Jan 2024', status: 'Completed' },
          { id: 2, type: 'Received', from: 'Ravi Traders', amount: 2100, date: '12 Jan 2024', status: 'Completed' },
          { id: 3, type: 'Pending', from: 'City Mandi', amount: 5900, date: '10 Jan 2024', status: 'Pending' },
        ]);
        setLoading(false);
      });
  }, []);

  const simulatePayment = () => {
    const newTransaction = {
      id: Date.now(),
      type: 'Received',
      from: 'Market Payment',
      amount: 1500,
      date: 'Just Now',
      status: 'Completed'
    };
    setTransactions([newTransaction, ...transactions]);
    setBalance(prev => prev + 1500);
    alert("Payment of ₹1500 received!");
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white col-span-2">
          <p className="text-emerald-100 font-medium mb-1">Total Earnings</p>
          <h2 className="text-4xl font-bold mb-4">₹{balance.toLocaleString()}</h2>
          <div className="flex gap-4">
            <Button onClick={simulatePayment} className="bg-white text-emerald-600 hover:bg-emerald-50 border-none">
              Simulate Incoming Payment
            </Button>
          </div>
        </Card>
        <Card className="p-6 flex flex-col justify-center items-center text-center">
          <div className="bg-orange-100 p-4 rounded-full mb-3">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-gray-500 text-sm">Pending Payments</p>
          <h3 className="text-2xl font-bold text-gray-800">₹5,900</h3>
        </Card>
      </div>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-xl">
            <CreditCard className="text-purple-600 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
        </div>

        <div className="space-y-4">
          {transactions.length > 0 ? transactions.map((tx) => (
            <div key={tx.id} className="flex flex-col sm:flex-row justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-4 mb-2 sm:mb-0 w-full sm:w-auto">
                <div className={`p-2 rounded-lg ${tx.type === 'Received' ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {tx.type === 'Received' ? <DollarSign className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-orange-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{tx.from}</h4>
                  <p className="text-sm text-gray-500">{tx.date}</p>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end">
                <p className={`text-lg font-bold ${tx.type === 'Received' ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {tx.type === 'Received' ? '+' : ''}₹{tx.amount}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-8">No recent transactions found.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Payments;
