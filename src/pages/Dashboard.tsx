import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { Booking } from '../types';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">MY BOOKINGS</h1>
          <p className="text-white/50">Manage your current and past rentals</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-40 glass-card rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-[3rem]">
          <p className="text-white/50 text-xl italic mb-6">You haven't made any bookings yet.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-primary text-black px-8 py-3 rounded-full font-bold"
          >
            Browse Cars
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking, index) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {booking.id}
                  </div>
                  <div className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {booking.status}
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{booking.carName}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-white/60">
                    <Calendar size={18} className="text-primary" />
                    <span className="text-sm">{booking.pickupDate} to {booking.returnDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <CreditCard size={18} className="text-primary" />
                    <span className="text-sm font-bold text-white">${booking.totalPrice} Paid</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl font-bold transition-all">
                  View Details
                </button>
                <button className="bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/10 px-6 py-3 rounded-2xl font-bold transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
