import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(process.cwd(), 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'driveshare-secret-key';

async function initDB() {
  try {
    console.log('Checking for DB file at:', DB_FILE);
    await fs.access(DB_FILE);
    console.log('DB file exists.');
  } catch {
    console.log('DB file not found, creating initial data...');
    const initialData = {
      users: [],
      cars: [
        { id: '1', name: 'Tesla Model S', type: 'Electric', price: 150, rating: 4.9, image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800', description: 'Luxury electric sedan with autopilot.' },
        { id: '2', name: 'BMW M4', type: 'Sports', price: 120, rating: 4.8, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800', description: 'High-performance sports coupe.' },
        { id: '3', name: 'Range Rover Sport', type: 'SUV', price: 180, rating: 4.7, image: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=800', description: 'Luxury SUV with off-road capability.' },
        { id: '4', name: 'Porsche 911', type: 'Sports', price: 250, rating: 5.0, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800', description: 'Iconic sports car with precision handling.' },
        { id: '5', name: 'Audi Q8', type: 'SUV', price: 160, rating: 4.6, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800', description: 'Modern luxury SUV with advanced tech.' },
        { id: '6', name: 'Mercedes S-Class', type: 'Luxury', price: 200, rating: 4.9, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800', description: 'The pinnacle of luxury sedans.' }
      ],
      bookings: []
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('DB file created.');
  }
}

async function readDB() {
  try {
    console.log('Reading DB from:', DB_FILE);
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    console.log('DB read successfully. Users:', parsed.users?.length, 'Cars:', parsed.cars?.length);
    return parsed;
  } catch (error) {
    console.error('Error reading DB file:', error);
    throw error;
  }
}

async function writeDB(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Request Logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Auth Routes
  app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    const db = await readDB();
    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), name, email, password: hashedPassword, role: 'user' };
    db.users.push(newUser);
    await writeDB(db);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, name, email, role: newUser.role } });
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await readDB();
    const user = db.users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  });

  // Car Routes
  app.get('/api/cars', async (req, res) => {
    console.log('GET /api/cars request received');
    try {
      const db = await readDB();
      console.log(`DB read for cars: ${db?.cars?.length} cars found`);
      if (!db || !Array.isArray(db.cars)) {
        console.error('Invalid DB structure:', db);
        return res.status(500).json({ error: 'Database structure is invalid' });
      }
      res.json(db.cars);
    } catch (error) {
      console.error('Error reading cars:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/cars', authenticate, async (req: any, res: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const db = await readDB();
    const newCar = { ...req.body, id: Date.now().toString() };
    db.cars.push(newCar);
    await writeDB(db);
    res.json(newCar);
  });

  app.put('/api/cars/:id', authenticate, async (req: any, res: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const db = await readDB();
    const index = db.cars.findIndex((c: any) => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Car not found' });
    db.cars[index] = { ...db.cars[index], ...req.body };
    await writeDB(db);
    res.json(db.cars[index]);
  });

  app.delete('/api/cars/:id', authenticate, async (req: any, res: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const db = await readDB();
    db.cars = db.cars.filter((c: any) => c.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
  });

  // Booking Routes
  app.post('/api/book', authenticate, async (req: any, res: any) => {
    const db = await readDB();
    const newBooking = {
      ...req.body,
      id: 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: req.user.id,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    db.bookings.push(newBooking);
    await writeDB(db);
    res.json(newBooking);
  });

  app.get('/api/bookings', authenticate, async (req: any, res: any) => {
    const db = await readDB();
    if (req.user.role === 'admin') {
      res.json(db.bookings);
    } else {
      res.json(db.bookings.filter((b: any) => b.userId === req.user.id));
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DB_FILE path:', DB_FILE);
  });
}

startServer();
