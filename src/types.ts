export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Car {
  id: string;
  name: string;
  type: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  lat?: number;
  lng?: number;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  carName: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}
