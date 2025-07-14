import { Table, Reservation } from '@/types';
import { db } from './firebase';
import { collection, doc, getDocs, updateDoc, setDoc, getDoc, writeBatch, deleteField, FieldValue } from 'firebase/firestore';

// --- FIRESTORE TABLES SERVICE ---

export const getTables = async (): Promise<Table[]> => {
  const snapshot = await getDocs(collection(db, 'tables'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table));
};

export const updateTable = async (tableId: string, data: Partial<Table>) => {
  const ref = doc(db, 'tables', tableId);
  const updateData = { ...data };
  if ('reservationId' in updateData && updateData.reservationId === null) {
    updateData.reservationId = deleteField();
  }
  await updateDoc(ref, updateData);
};

export const updateTables = async (tableIds: string[], data: Partial<Table>) => {
  const batch = writeBatch(db);
  tableIds.forEach(tableId => {
    const ref = doc(db, 'tables', tableId);
    const updateData = { ...data };
    if ('reservationId' in updateData && updateData.reservationId === null) {
      updateData.reservationId = deleteField();
    }
    batch.update(ref, updateData);
  });
  await batch.commit();
};

export const resetTables = async () => {
  // Resetuje všechny stoly na 'blocked' (nebo podle potřeby)
  const snapshot = await getDocs(collection(db, 'tables'));
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSnap => {
    batch.update(docSnap.ref, { status: 'blocked', reservationId: deleteField() });
  });
  await batch.commit();
};

export const addTable = async (table: Table) => {
  const ref = doc(db, 'tables', table.id);
  await setDoc(ref, table);
};

// --- REZERVACE: PŮVODNÍ IMPLEMENTACE (zatím) ---
// (Můžete později přepsat na Firestore podle potřeby)

// Funkce pro načtení rezervací z localStorage
const loadReservationsFromStorage = (): Reservation[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('akvarezervace_reservations');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Převedeme stringy zpět na objekty Date
      return parsed.map((reservation: any) => ({
        ...reservation,
        createdAt: new Date(reservation.createdAt),
        updatedAt: new Date(reservation.updatedAt)
      }));
    }
  } catch (error) {
    console.error('Error loading reservations from localStorage:', error);
  }
  return [];
};

// Funkce pro uložení rezervací do localStorage
const saveReservationsToStorage = (reservations: Reservation[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('akvarezervace_reservations', JSON.stringify(reservations));
  } catch (error) {
    console.error('Error saving reservations to localStorage:', error);
  }
};

let localReservations = loadReservationsFromStorage();

export const getReservations = async (): Promise<Reservation[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return localReservations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const newReservation: Reservation = {
    ...reservation,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  localReservations.push(newReservation);
  saveReservationsToStorage(localReservations);
  await updateTables(reservation.tableIds, {
    status: 'available',
    reservationId: newReservation.id
  });
  return newReservation.id;
};

export const updateReservation = async (reservationId: string, data: Partial<Reservation>) => {
  const reservationIndex = localReservations.findIndex(r => r.id === reservationId);
  if (reservationIndex !== -1) {
    localReservations[reservationIndex] = {
      ...localReservations[reservationIndex],
      ...data,
      updatedAt: new Date()
    };
    saveReservationsToStorage(localReservations);
  }
};

export const deleteReservation = async (reservationId: string) => {
  const reservation = localReservations.find(r => r.id === reservationId);
  if (reservation) {
    for (const tableId of reservation.tableIds) {
      await updateTable(tableId, {
        status: 'available',
        reservationId: null // deleteField se použije v updateTable
      });
    }
  }
  localReservations = localReservations.filter(r => r.id !== reservationId);
  saveReservationsToStorage(localReservations);
};

export const deleteAllReservations = async () => {
  for (const reservation of localReservations) {
    for (const tableId of reservation.tableIds) {
      await updateTable(tableId, {
        status: 'available',
        reservationId: null // deleteField se použije v updateTable
      });
    }
  }
  localReservations = [];
  saveReservationsToStorage(localReservations);
}; 