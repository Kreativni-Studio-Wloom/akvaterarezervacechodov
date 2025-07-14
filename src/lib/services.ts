import { Table, Reservation } from '@/types';
import { db } from './firebase';
import { collection, doc, getDocs, updateDoc, setDoc, getDoc, writeBatch, deleteField, FieldValue, Timestamp } from 'firebase/firestore';

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

// --- REZERVACE: FIRESTORE IMPLEMENTACE ---

// Pomocné funkce pro převod mezi Firestore a JS objektem
function reservationFromFirestore(id: string, data: any): Reservation {
  return {
    id,
    tableIds: data.tableIds,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    status: data.status,
    createdAt: (data.createdAt instanceof Timestamp)
      ? data.createdAt.toDate()
      : new Date(data.createdAt),
    updatedAt: (data.updatedAt instanceof Timestamp)
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt),
  };
}

function reservationToFirestore(reservation: Reservation) {
  return {
    ...reservation,
    createdAt: reservation.createdAt instanceof Date ? reservation.createdAt : new Date(reservation.createdAt),
    updatedAt: reservation.updatedAt instanceof Date ? reservation.updatedAt : new Date(reservation.updatedAt),
  };
}

export const getReservations = async (): Promise<Reservation[]> => {
  const snapshot = await getDocs(collection(db, 'reservations'));
  return snapshot.docs.map(doc => reservationFromFirestore(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const newReservation: Reservation = {
    ...reservation,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const ref = doc(db, 'reservations', newReservation.id);
  await setDoc(ref, reservationToFirestore(newReservation));
  await updateTables(reservation.tableIds, {
    status: 'available',
    reservationId: newReservation.id
  });
  return newReservation.id;
};

export const updateReservation = async (reservationId: string, data: Partial<Reservation>) => {
  const ref = doc(db, 'reservations', reservationId);
  const docSnap = await getDoc(ref);
  if (!docSnap.exists()) return;
  const oldData = reservationFromFirestore(docSnap.id, docSnap.data());
  const updated: Reservation = {
    ...oldData,
    ...data,
    updatedAt: new Date()
  };
  await setDoc(ref, reservationToFirestore(updated));
};

export const deleteReservation = async (reservationId: string) => {
  const ref = doc(db, 'reservations', reservationId);
  const docSnap = await getDoc(ref);
  if (docSnap.exists()) {
    const reservation = reservationFromFirestore(docSnap.id, docSnap.data());
    for (const tableId of reservation.tableIds) {
      await updateTable(tableId, {
        status: 'available',
        reservationId: null
      });
    }
  }
  await import('firebase/firestore').then(({ deleteDoc }) => deleteDoc(ref));
};

export const deleteAllReservations = async () => {
  const snapshot = await getDocs(collection(db, 'reservations'));
  for (const docSnap of snapshot.docs) {
    const reservation = reservationFromFirestore(docSnap.id, docSnap.data());
    for (const tableId of reservation.tableIds) {
      await updateTable(tableId, {
        status: 'available',
        reservationId: null
      });
    }
    await import('firebase/firestore').then(({ deleteDoc }) => deleteDoc(docSnap.ref));
  }
}; 