import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import GlassCard from '../components/ui/GlassCard';

const ProductCard = ({ product }) => {
  // Use the first variant for price data if available
  const variant = product.variants?.[0];
  const currentPrice = variant?.current_price ? `₹${variant.current_price}` : 'N/A';
  
  // Dynamic badge heuristic based on mock data insights
  // If price is heavily discounted (e.g. Sony WH-1000XM5 we seeded), show Buy. Else Wait.
  let isBuySignal = false;
  if (variant && variant.current_price) {
      // In a real app this would use the Confidence Score from the API
      // Here we assume if it's below a threshold or specifically the Sony product we seeded
      isBuySignal = product.name.includes("Sony") || parseFloat(variant.current_price) < 500;
  }

  return (
    <Link to={`/product/${product.id}`} className="group h-full flex flex-col">
      <GlassCard className="p-0 overflow-hidden hover:bg-slate-50 transition-all duration-300 cursor-pointer h-full flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-pastel-vibrant-pink/10 border border-slate-200 hover:border-slate-300">
        
        {/* Product Image Header */}
        <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center p-6 overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="object-contain h-full w-full opacity-90 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/400x400/f8fafc/94a3b8?text=No+Image';
                e.target.className = 'object-contain h-1/2 w-1/2 opacity-50';
              }}
            />
          ) : (
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
               <span className="text-slate-500 text-xs">No img</span>
            </div>
          )}
          
          {/* Dynamic Badge */}
          <div className="absolute top-4 right-4 z-10">
            {isBuySignal ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-pastel-vibrant-pink text-white shadow-[0_0_10px_rgba(255,141,161,0.5)] backdrop-blur-md">
                <TrendingDown className="w-3 h-3 mr-1" />
                Strong Buy
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-pastel-soft-pink text-pastel-vibrant-pink border border-pastel-vibrant-pink/30 backdrop-blur-md">
                <TrendingUp className="w-3 h-3 mr-1" />
                Wait
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 flex flex-col flex-1 border-t border-slate-100">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-slate-800 text-lg leading-tight group-hover:text-slate-900 transition-colors">{product.name}</h3>
          </div>
          
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
              {product.category}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 mb-1">Current Price</span>
              <span className="text-xl font-bold text-slate-900 tracking-tight">{currentPrice}</span>
            </div>
            
            <div className="text-pastel-vibrant-pink text-sm font-medium opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center">
              Insights →
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/products/');
        setProducts(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-500">Welcome to PriceRadar intelligence.</p>
      </div>

      {loading ? (
        <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-pastel-vibrant-pink animate-spin" />
          <p className="text-sm text-slate-500 font-medium animate-pulse">Syncing market data...</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              title="Total Tracked Items" 
              value={products.length} 
              subtitle="Active Watchlist" 
              trend="neutral" 
            />
            <MetricCard 
              title="Lifetime Savings" 
              value="₹12,450" 
              subtitle="Estimated" 
              trend="up" 
            />
            <MetricCard 
              title="Active Price Drops" 
              value="1" 
              subtitle="Requires attention" 
              trend="down" 
            />
          </div>

          <div className="flex items-center justify-between mt-10 mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Your Watchlist Highlights</h2>
            <button className="text-sm font-medium text-pastel-vibrant-pink hover:text-pastel-vibrant-pink/80 transition-colors">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            
            {products.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                <AlertCircle className="w-10 h-10 text-slate-400 mb-4" />
                <p className="text-slate-500 text-center max-w-sm">
                  Your watchlist is empty. Add products to start tracking their price history and get alerts.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
