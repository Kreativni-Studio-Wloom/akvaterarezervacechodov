import { Table, Reservation } from '@/types';

// Grid 24x16, všechna pole nerezervovatelná (blocked)
export const mockTables: Table[] = [];

for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 24; x++) {
    mockTables.push({
      id: `${x}-${y}`,
      x,
      y,
      status: 'blocked'
    });
  }
}

// Mock data pro rezervace (prázdné)
export const mockReservations: Reservation[] = []; 