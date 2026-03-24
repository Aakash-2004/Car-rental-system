import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Car as CarIcon, DollarSign, Star } from 'lucide-react';
import { Car } from '../types';
import toast from 'react-hot-toast';

export default function Admin() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Car>>({
    name: '', type: 'SUV', price: 100, rating: 4.5, image: '', description: ''
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      const data = await response.json();
      setCars(data);
    } catch (error) {
      toast.error('Failed to load cars');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success('Car added successfully');
        setShowForm(false);
        fetchCars();
      }
    } catch (error) {
      toast.error('Failed to add car');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Car deleted');
        fetchCars();
      }
    } catch (error) {
      toast.error('Failed to delete car');
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">FLEET MANAGEMENT</h1>
          <p className="text-white/50">Add and manage your rental vehicles</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Add Vehicle</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-card rounded-[2.5rem] p-10 relative">
            <h2 className="text-2xl font-bold mb-8">Add New Vehicle</h2>
            <form onSubmit={handleAddCar} className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase">Car Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase">Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none"
                >
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Electric">Electric</option>
                  <option value="Sports">Sports</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase">Price per Day</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase">Rating</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase">Image URL</label>
                <input 
                  type="text" 
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase">Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none h-24"
                />
              </div>
              <div className="col-span-2 flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-primary text-black py-4 rounded-2xl font-bold">Save Vehicle</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 py-4 rounded-2xl font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {cars.map(car => (
          <div key={car.id} className="glass-card rounded-3xl p-6 flex items-center gap-8">
            <img src={car.image} className="w-32 h-24 object-cover rounded-2xl" alt={car.name} />
            <div className="flex-1">
              <h3 className="text-xl font-bold">{car.name}</h3>
              <p className="text-white/50 text-sm">{car.type} • ${car.price}/day</p>
            </div>
            <div className="flex gap-3">
              <button className="p-3 hover:bg-white/10 rounded-xl transition-colors"><Edit3 size={20} /></button>
              <button onClick={() => handleDelete(car.id)} className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
