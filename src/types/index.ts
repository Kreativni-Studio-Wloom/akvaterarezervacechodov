export interface Table {
  id: string;
  x: number;
  y: number;
  status: 'available' | 'reserved' | 'permanent' | 'entrance' | 'pending' | 'blocked';
  reservationId?: string | null;
}

export interface Reservation {
  id: string;
  tableIds: string[];
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
} 