import { NextResponse } from 'next/server';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  try {
    // Vytvoříme grid 24x16 stolů, všechny dostupné
    const tables = [];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 24; x++) {
        let status: 'available' = 'available';
        tables.push({
          id: `${x}-${y}`,
          x,
          y,
          status
        });
      }
    }
    // Uložíme stoly do Firestore
    const batch = [];
    for (const table of tables) {
      const docRef = doc(db, 'tables', table.id);
      batch.push(setDoc(docRef, table));
    }
    await Promise.all(batch);
    return NextResponse.json({ 
      success: true, 
      message: `Inicializováno ${tables.length} stolů` 
    });
  } catch (error) {
    console.error('Error initializing tables:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při inicializaci' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Smažeme všechny existující stoly
    const existing = await getDocs(collection(db, 'tables'));
    const deleteBatch: Promise<void>[] = [];
    let count = 0;
    existing.forEach((docSnap) => {
      deleteBatch.push(deleteDoc(doc(db, 'tables', docSnap.id)));
      count++;
    });
    await Promise.all(deleteBatch);
    console.log(`Mazání stolů: našel jsem ${existing.size}, smazal jsem ${count}`);
    return NextResponse.json({ success: true, message: `Smazáno ${count} stolů.` });
  } catch (error) {
    console.error('Error deleting tables:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při mazání stolů' },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    // Přidám nebo upravím jeden konkrétní stůl 0-8
    const table = {
      id: '0-8',
      x: 0,
      y: 8,
      status: 'available'
    };
    await setDoc(doc(db, 'tables', table.id), table);
    return NextResponse.json({ success: true, message: 'Stůl 0-8 byl přidán nebo upraven.' });
  } catch (error) {
    console.error('Error adding table 0-8:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při přidávání stolu 0-8' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Vrátím všechny stoly v databázi
    const existing = await getDocs(collection(db, 'tables'));
    const tables = existing.docs.map(docSnap => docSnap.data());
    return NextResponse.json({ success: true, tables });
  } catch (error) {
    console.error('Error getting tables:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání stolů' },
      { status: 500 }
    );
  }
} 