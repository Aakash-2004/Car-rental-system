import React, { useState } from 'react';
import { X, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car } from '../types';
import { format, addDays, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

interface BookingModalProps {
  car: Car | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ car, onClose, onSuccess }: BookingModalProps) {
  const [pickupDate, setPickupDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [returnDate, setReturnDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  if (!car) return null;

  const days = Math.max(1, differenceInDays(new Date(returnDate), new Date(pickupDate)));
  const total = days * car.price;

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to book a car');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: car.id,
          carName: car.name,
          pickupDate,
          returnDate,
          totalPrice: total
        })
      });

      if (response.ok) {
        setStep(3);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        toast.error('Booking failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg glass-card rounded-[2rem] overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-2xl overflow-hidden">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{car.name}</h2>
                  <p className="text-white/50 text-sm">{car.type} • ${car.price}/day</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Pickup Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input 
                      type="date" 
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input 
                      type="date" 
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Daily Rate</span>
                  <span>${car.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Duration</span>
                  <span>{days} days</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-primary">${total}</span>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-primary hover:bg-primary/90 text-black py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/20"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Payment Details</h2>
                <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <span className="text-primary font-bold text-sm">${total}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">Credit / Debit Card</p>
                    <p className="text-xs text-white/50">Secure checkout via Stripe</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM / YY"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">CVV</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <Calendar size={16} />
                    <span>{format(new Date(pickupDate), 'MMM d')} - {format(new Date(returnDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <button 
                  onClick={handleBooking}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 text-black py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : `Confirm & Pay $${total}`}
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="w-full text-white/50 hover:text-white transition-colors text-sm font-medium"
                >
                  Back to Details
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 flex flex-col items-center text-center space-y-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 size={48} className="text-secondary" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-white/50">Your ride is ready. Check your dashboard for details.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
