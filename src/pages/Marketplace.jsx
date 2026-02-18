import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CropCard from '../components/CropCard';
import BidModal from '../components/BidModal';
import ProfileModal from '../components/ProfileModal';
import ReportModal from '../components/ReportModal';
import { Search, Filter, ShoppingCart, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewProfileUser, setViewProfileUser] = useState(null);
  const [reportEntity, setReportEntity] = useState(null);
  const { t } = useLanguage();

  const filters = ['All', 'Vegetables', 'Fruits', 'Grains', 'Equipment'];

  // Mock Data (Enhanced with quality and minPrice)
  const [products, setProducts] = useState([
    { id: 1, name: 'Organic Tomato', category: 'Vegetables', price: 40, unit: 'kg', quantity: 500, seller: 'Ravi Kumar', color: 'bg-red-100', quality: 'A', minPrice: 35, highestBid: 38 },
    { id: 2, name: 'Fresh Potato', category: 'Vegetables', price: 25, unit: 'kg', quantity: 1200, seller: 'Lakshmi Devi', color: 'bg-amber-100', quality: 'B', minPrice: 20 },
    { id: 3, name: 'Wheat (Sona Moti)', category: 'Grains', price: 2100, unit: 'quintal', quantity: 50, seller: 'Krishna Rao', color: 'bg-yellow-100', quality: 'A', minPrice: 2000 },
    { id: 4, name: 'Green Chilli', category: 'Vegetables', price: 60, unit: 'kg', quantity: 200, seller: 'Anitha S', color: 'bg-green-100', quality: 'C', minPrice: 50 },
    { id: 5, name: 'Bananas', category: 'Fruits', price: 30, unit: 'dozen', quantity: 100, seller: 'Srinu V', color: 'bg-yellow-200', quality: 'A', minPrice: 28 },
    { id: 6, name: 'Paddy Seeds', category: 'Grains', price: 800, unit: 'bag', quantity: 20, seller: 'Agro Corp', color: 'bg-emerald-100', quality: 'A', minPrice: 750 },
  ]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || product.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleBidSubmit = (productId, amount) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, highestBid: amount } : p
    ));
    alert(`Bid of ₹${amount} placed successfully!`);
  };

  const openProfile = (sellerName) => {
    setViewProfileUser({ name: sellerName });
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-6 rounded-2xl backdrop-blur-sm shadow-sm md:sticky md:top-20 z-40">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-emerald-600" /> {t('marketplace')}
          </h1>
          <p className="text-sm text-gray-500">Buy and sell fresh produce directly.</p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search crops, seeds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <Button variant="outline" className="px-3" title="Filter">
            <Filter size={20} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${activeFilter === filter
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <CropCard
              key={product.id}
              product={product}
              onBid={() => setSelectedProduct(product)}
              onProfileClick={() => openProfile(product.seller)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-gray-300">
          <h3 className="text-xl font-medium text-gray-500">No products found for "{searchTerm}"</h3>
          <Button variant="ghost" onClick={() => { setSearchTerm(''); setActiveFilter('All'); }} className="mt-2 text-emerald-600">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Bid Modal */}
      <BidModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onSubmitBid={handleBidSubmit}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={!!viewProfileUser}
        onClose={() => setViewProfileUser(null)}
        user={viewProfileUser}
        onReport={() => {
          setReportEntity(viewProfileUser.name);
          setViewProfileUser(null);
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={!!reportEntity}
        onClose={() => setReportEntity(null)}
        entityName={reportEntity}
      />
    </div>
  );
};

export default Marketplace;
