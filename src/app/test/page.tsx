'use client';

import { useState } from 'react';
import { getTables, getReservations, createReservation } from '@/lib/services';
import { sendConfirmationEmail } from '@/lib/email';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testTables = async () => {
    setLoading(true);
    try {
      const tables = await getTables();
      setResult(`Načteno ${tables.length} stolů`);
    } catch (error) {
      setResult(`Chyba: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testReservations = async () => {
    setLoading(true);
    try {
      const reservations = await getReservations();
      setResult(`Načteno ${reservations.length} rezervací`);
    } catch (error) {
      setResult(`Chyba: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateReservation = async () => {
    setLoading(true);
    try {
      const reservationId = await createReservation({
        tableIds: ['1-1', '2-1'],
        firstName: 'Test',
        lastName: 'Uživatel',
        phone: '+420 123 456 789',
        email: 'test@example.com',
        status: 'pending'
      });
      setResult(`Vytvořena rezervace s ID: ${reservationId}`);
    } catch (error) {
      setResult(`Chyba: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async () => {
    setLoading(true);
    try {
      await sendConfirmationEmail('test@example.com', 'Test', 'Uživatel');
      setResult('E-mail odeslán (simulováno)');
    } catch (error) {
      setResult(`Chyba: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test aplikace</h1>
        
        <div className="grid gap-4">
          <button
            onClick={testTables}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Test načtení stolů
          </button>
          
          <button
            onClick={testReservations}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Test načtení rezervací
          </button>
          
          <button
            onClick={testCreateReservation}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Test vytvoření rezervace
          </button>
          
          <button
            onClick={testEmail}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Test odeslání e-mailu
          </button>
        </div>
        
        {result && (
          <div className="mt-8 p-4 bg-white rounded-lg border">
            <h3 className="font-semibold mb-2">Výsledek:</h3>
            <p className="text-gray-700">{result}</p>
          </div>
        )}
        
        <div className="mt-8">
          <a href="/" className="text-blue-600 hover:underline">
            ← Zpět na hlavní stránku
          </a>
        </div>
      </div>
    </div>
  );
} 