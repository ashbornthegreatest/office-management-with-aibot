import React from 'react';
import { Product } from '../types';
import { TrendingUp, Users, Server, ExternalLink } from 'lucide-react';

interface Props {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const latestStats = product.history[product.history.length - 1];

  return (
    <div 
        onClick={() => onClick(product)}
        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full"
    >
        {/* Header */}
        <div className={`h-24 bg-gradient-to-r ${product.logoColor} p-6 flex justify-between items-start text-white relative`}>
            <div>
                <h3 className="text-xl font-bold">{product.name}</h3>
                <span className="text-xs opacity-90 bg-white/20 px-2 py-0.5 rounded-full inline-block mt-1">
                    {product.status}
                </span>
            </div>
            <ExternalLink size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
            <p className="text-sm text-gray-500 mb-6 italic">{product.tagline}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-1">
                        <TrendingUp size={14} /> Profit (Mo)
                    </div>
                    <div className={`text-lg font-bold ${latestStats.profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${latestStats.profit.toLocaleString()}
                    </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-1">
                        <Users size={14} /> Active Users
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                        {latestStats.traffic.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center gap-1">
                <Server size={12} /> Cost: ${(latestStats.serverCost + latestStats.inputCost).toLocaleString()}
            </span>
            <span className="text-indigo-600 font-bold group-hover:underline">View Analytics &rarr;</span>
        </div>
    </div>
  );
};