import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Filter, Map as MapIcon, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarCard } from '../components/CarCard';
import BookingModal from '../components/BookingModal';
import { Car } from '../types';
import toast from 'react-hot-toast';
import GoogleMapReact from 'google-map-react';

const Marker = ({ car, onClick }: { car: Car; onClick: () => void; lat: number; lng: number; key?: any }) => (
  <div 
    onClick={onClick}
    className="relative group cursor-pointer"
  >
    <div className="bg-primary text-black px-3 py-1 rounded-full font-bold text-xs shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform">
      ${car.price}
    </div>
    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-lg" />
  </div>
);

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapView, setIsMapView] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const fetchCars = async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      console.log('Fetching cars from /api/cars...');
      const response = await fetch('/api/cars', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const text = await response.text();
        console.error('Server error response:', text);
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Cars fetched successfully:', data);
      if (!Array.isArray(data)) {
        console.error('Expected array of cars, but got:', data);
        throw new Error('Invalid data format received from server');
      }
      setCars(data);
      setFilteredCars(data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. The server might be slow or unresponsive.');
      } else {
        setError(err.message || 'Failed to load cars');
      }
      toast.error('Failed to load cars');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    let result = cars;
    if (search) {
      result = result.filter(car => car.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedType !== 'All') {
      result = result.filter(car => car.type === selectedType);
    }
    setFilteredCars(result);
  }, [search, selectedType, cars]);

  console.log('Home render - cars:', cars.length, 'filteredCars:', filteredCars.length, 'isLoading:', isLoading, 'error:', error);

  const types = ['All', ...new Set(cars.map(c => c.type))];

  const defaultProps = {
    center: {
      lat: 37.7749,
      lng: -122.4194
    },
    zoom: 13
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-[3rem] overflow-hidden mb-12">
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920" 
          alt="Hero" 
          className="w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
          >
            DRIVE YOUR <span className="text-primary">DREAM</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl mb-12"
          >
            Experience luxury and performance with our premium fleet. Rent the best cars at unbeatable prices.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-5xl glass-card p-4 rounded-3xl flex flex-col md:flex-row gap-4 shadow-2xl"
          >
            <div className="flex-[1.5] flex items-center gap-3 px-4 bg-white/5 rounded-2xl border border-white/10">
              <MapPin className="text-primary" size={20} />
              <input 
                type="text" 
                placeholder="Where are you going?"
                className="bg-transparent w-full py-4 outline-none"
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 bg-white/5 rounded-2xl border border-white/10">
              <Calendar className="text-primary" size={20} />
              <div className="flex flex-col w-full">
                <span className="text-[10px] text-white/30 uppercase font-bold">Pickup</span>
                <input 
                  type="date" 
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-transparent w-full py-1 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 bg-white/5 rounded-2xl border border-white/10">
              <Calendar className="text-primary" size={20} />
              <div className="flex flex-col w-full">
                <span className="text-[10px] text-white/30 uppercase font-bold">Return</span>
                <input 
                  type="date" 
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-transparent w-full py-1 outline-none text-sm"
                />
              </div>
            </div>
            <button className="bg-primary hover:bg-primary/90 text-black px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
              <Search size={20} />
              <span>Search</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 rounded-full border transition-all whitespace-nowrap ${
                selectedType === type 
                ? 'bg-primary border-primary text-black font-bold' 
                : 'border-white/10 hover:border-white/30'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex">
            <button 
              onClick={() => setIsMapView(false)}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 px-4 ${!isMapView ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}
            >
              <Grid size={18} />
              <span className="text-sm font-bold">Grid</span>
            </button>
            <button 
              onClick={() => setIsMapView(true)}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 px-4 ${isMapView ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}
            >
              <MapIcon size={18} />
              <span className="text-sm font-bold">Map</span>
            </button>
          </div>

          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search car model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Car Grid / Map */}
      <div className="mb-4 text-xs text-white/20 flex gap-4">
        <span>Status: {isLoading ? 'Loading...' : 'Idle'}</span>
        <span>Cars: {cars.length}</span>
        {error && <span className="text-red-500/50">Error: {error}</span>}
      </div>

      <AnimatePresence mode="wait">
        {isMapView ? (
          <motion.div 
            key="map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-[600px] w-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative"
          >
            <GoogleMapReact
              defaultCenter={defaultProps.center}
              defaultZoom={defaultProps.zoom}
              options={{
                styles: mapDarkStyles,
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              {filteredCars.map(car => (
                <Marker
                  key={car.id}
                  lat={car.lat || 37.7749}
                  lng={car.lng || -122.4194}
                  car={car}
                  onClick={() => setSelectedCar(car)}
                />
              ))}
            </GoogleMapReact>
            {!(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-12 text-center">
                <div className="max-w-md">
                  <MapPin size={48} className="text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Google Maps API Key Required</h3>
                  <p className="text-white/50 mb-8">Please add your Google Maps API key to the environment variables to enable the interactive map view.</p>
                  <button 
                    onClick={() => setIsMapView(false)}
                    className="bg-primary text-black px-8 py-3 rounded-full font-bold"
                  >
                    Back to Grid View
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error && (
              <div className="text-center py-24 glass-card rounded-[3rem] border-red-500/20">
                <p className="text-red-500 text-xl mb-6 font-bold">{error}</p>
                <button 
                  onClick={fetchCars}
                  className="bg-primary text-black px-8 py-3 rounded-full font-bold"
                >
                  Retry Fetching
                </button>
              </div>
            )}

            {!error && isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-96 glass-card rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCars.map(car => (
                  <CarCard 
                    key={car.id} 
                    car={car} 
                    onBook={(car: Car) => setSelectedCar(car)} 
                  />
                ))}
              </div>
            )}

            {filteredCars.length === 0 && !isLoading && !error && (
              <div className="text-center py-24">
                <p className="text-white/50 text-xl italic">No cars found matching your search.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal 
        car={selectedCar} 
        onClose={() => setSelectedCar(null)} 
        onSuccess={() => {
          toast.success('Booking successful!');
        }}
      />
    </div>
  );
}

const mapDarkStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
  { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];
