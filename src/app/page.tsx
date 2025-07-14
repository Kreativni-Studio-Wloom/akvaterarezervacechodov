'use client';

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import TableGrid from '@/components/TableGrid';
import TableLegend from '@/components/TableLegend';
import StatusBar from '@/components/StatusBar';
import ReservationForm from '@/components/ReservationForm';
import InfoModal from '@/components/InfoModal';
import { createReservation, updateTables } from '@/lib/services';
import { sendConfirmationEmail } from '@/lib/email';

export default function Home() {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTableSelect = (tableIds: string[]) => {
    setSelectedTables(tableIds);
  };

  const handleFormSubmit = async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }) => {
    if (selectedTables.length === 0) {
      toast.error('Vyberte alespoň jeden stůl');
      return;
    }

    setLoading(true);
    try {
      // Vytvoříme rezervaci
      const reservationId = await createReservation({
        tableIds: selectedTables,
        ...data,
        status: 'pending'
      });

      // Stoly zůstávají available, ale mají reservationId pro identifikaci
      await updateTables(selectedTables, {
        status: 'available',
        reservationId
      });

      // Pošleme potvrzovací e-mail
      await sendConfirmationEmail(data.email, data.firstName, data.lastName, selectedTables);

      toast.success('Rezervace byla úspěšně odeslána!');
      setSelectedTables([]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Došlo k chybě při vytváření rezervace');
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedTables([]);
  };

  const handleClearSelection = () => {
    setSelectedTables([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <InfoModal />
      
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-black">
                Rezervace stolů na AkvaTera trzích Chodov
              </h1>
              <p className="mt-1 text-sm text-black">
                Vyberte si stoly a vytvořte rezervaci
              </p>
            </div>
            <a
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Admin
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        <TableLegend />

        <TableGrid
          onTableSelect={handleTableSelect}
          selectedTables={selectedTables}
        />

        {selectedTables.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Rezervovat vybrané stoly ({selectedTables.length})
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <ReservationForm
          selectedTables={selectedTables}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      )}
    </div>
  );
}
