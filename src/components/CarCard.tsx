import React from 'react';
import { Star, Fuel, Gauge, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Car } from '../types';

interface CarCardProps {
  car: Car;
  onBook: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onBook }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-card rounded-3xl overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={car.image} 
          alt={car.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
          <Star size={14} className="text-primary fill-primary" />
          <span className="text-xs font-bold">{car.rating}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">{car.name}</h3>
            <span className="text-xs text-white/50 uppercase tracking-widest">{car.type}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-primary">${car.price}</span>
            <span className="text-xs text-white/50 block">/ day</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-white/5">
          <div className="flex flex-col items-center gap-1">
            <Fuel size={16} className="text-white/30" />
            <span className="text-[10px] text-white/50">Electric</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Gauge size={16} className="text-white/30" />
            <span className="text-[10px] text-white/50">Auto</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck size={16} className="text-white/30" />
            <span className="text-[10px] text-white/50">Insured</span>
          </div>
        </div>

        <button 
          onClick={() => onBook(car)}
          className="w-full bg-white/5 hover:bg-primary hover:text-black border border-white/10 py-3 rounded-2xl font-bold transition-all"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}
