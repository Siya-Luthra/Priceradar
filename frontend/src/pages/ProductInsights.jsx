import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ExternalLink, BellRing } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import PriceChart from '../components/ui/PriceChart';
import ConfidenceMeter from '../components/ui/ConfidenceMeter';
import MetricCard from '../components/ui/MetricCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const ProductInsights = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}/insights/`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch insights', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [id]);

  const handleAlertSubmit = (e) => {
    e.preventDefault();
    alert(`Alert set for ₹${targetPrice}`);
    setTargetPrice('');
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return <div className="text-slate-800">Product not found.</div>;
  }

  // Use first variant for primary display if available
  const primaryVariant = data.variant_insights?.[0] || {};
  const stats = primaryVariant.statistics || {};
  const score = primaryVariant.confidence_score || 50;
  const insights = primaryVariant.insights || [];
  const chartData = primaryVariant.chart_data || [];

  return (
    <div className="flex flex-col space-y-8 pb-12">
      <Link to="/" className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Header Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {data.product_name.split(' ').length > 1 ? (
              <>
                <span className="text-pastel-text-pink">{data.product_name.split(' ')[0]}</span>{' '}
                <span className="text-slate-900">{data.product_name.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              <span className="text-slate-900">{data.product_name}</span>
            )}
          </h1>
          
          <div className="flex items-baseline mt-6 mb-2">
            <span className="text-5xl font-bold text-pastel-price-blue">
              ₹{data.best_current_price || stats.current_price || 'N/A'}
            </span>
            {stats.lifetime_lowest && (
              <span className="ml-4 text-slate-500 text-sm">
                Lowest: ₹{Math.min(stats.lifetime_lowest, data.best_current_price || stats.current_price || stats.lifetime_lowest)}
              </span>
            )}
          </div>
          
          <div className="mt-8 space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-pastel-text-pink mt-2 mr-3 flex-shrink-0" />
                <p className="text-slate-600">{insight}</p>
              </div>
            ))}
          </div>

          {data.best_buy_link && (
            <a 
              href={data.best_buy_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center mt-8 px-6 py-3 bg-pastel-text-pink text-white font-bold rounded-lg hover:bg-pastel-text-pink/90 transition-colors shadow-md"
            >
              Buy Now <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          )}
        </div>

        {/* Confidence Meter Section */}
        <GlassCard className="p-8 flex flex-col items-center justify-center lg:w-72 flex-shrink-0 relative">
          <div className="w-full flex justify-between items-center absolute top-4 left-0 px-6">
            <h3 className="text-slate-900 font-bold">Custom score</h3>
            <span className="px-2 py-1 bg-pastel-badge-bg text-pastel-text-pink text-xs font-semibold rounded-md">
              Strong Buy
            </span>
          </div>
          <div className="mt-6">
            <ConfidenceMeter score={score} />
          </div>
          <p className="mt-6 text-sm text-center text-slate-600">
            {score >= 70 ? 'Strong buy signal based on historical trends.' : 
             score <= 30 ? 'Wait. Prices are likely to drop.' : 
             'Neutral. Market is stable.'}
          </p>
        </GlassCard>
      </div>

      {/* Chart Section */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Price History & Moving Averages</h3>
        <PriceChart data={chartData} />
      </GlassCard>

      {/* Smart Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Lifetime Low" 
          value={`₹${stats.lifetime_lowest !== undefined ? stats.lifetime_lowest : 'N/A'}`} 
          subtitle="Absolute Minimum" 
        />
        <MetricCard 
          title="Lifetime High" 
          value={`₹${stats.lifetime_highest !== undefined ? stats.lifetime_highest : 'N/A'}`} 
          subtitle="Peak Price" 
        />
        <MetricCard 
          title="Volatility" 
          value={`${stats.volatility !== undefined ? (stats.volatility * 100).toFixed(1) + '%' : 'N/A'}`} 
          subtitle="Price Variance" 
        />
      </div>

      {/* Comparison Grid & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Variant Comparisons</h3>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-pastel-table-header bg-pastel-table-header text-slate-800 text-sm">
                    <th className="p-4 font-medium rounded-tl-md">Variant</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Buy</th>
                    <th className="p-4 font-medium rounded-tr-md">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.variant_insights?.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors text-sm">
                      <td className="p-4 text-slate-600">
                        {v.attributes ? JSON.stringify(v.attributes) : 'Default'}
                      </td>
                      <td className="p-4 text-slate-900">
                        ₹{v.statistics?.current_price || 'N/A'}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        ₹{v.statistics?.current_price || 'N/A'}
                      </td>
                      <td className="p-4">
                        {v.product_url ? (
                          <a href={v.product_url} target="_blank" rel="noopener noreferrer" className="text-pastel-link-blue hover:underline inline-flex items-center">
                            More link <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-pastel-link-blue">More link</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Set Price Alert</h3>
          <GlassCard className="p-6">
            <p className="text-sm text-slate-500 mb-6">
              Get notified immediately via email when the price drops below your target.
            </p>
            <form onSubmit={handleAlertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Target Price (₹)</label>
                <input 
                  type="number" 
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Target Price"
                  className="w-full bg-pastel-input-bg border-none rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-pastel-text-pink transition-colors"
                />
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-800 mb-2">Create Alert</label>
                <input 
                  type="text" 
                  placeholder="Target Price"
                  className="w-full bg-pastel-input-bg border-none rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-pastel-text-pink transition-colors mb-4"
                />
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center py-2.5 bg-pastel-text-pink hover:bg-pastel-text-pink/90 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Create Alert
              </button>
            </form>
          </GlassCard>
        </div>
      </div>

    </div>
  );
};

export default ProductInsights;
