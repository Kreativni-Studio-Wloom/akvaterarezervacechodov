'use client';

import { useState, useEffect } from 'react';
import { Reservation, Table } from '@/types';
import { getReservations, updateReservation, deleteReservation, deleteAllReservations, updateTables, updateTable, resetTables } from '@/lib/services';
import { sendApprovalEmail, sendCancelledEmail } from '@/lib/email';
import { Check, X, Trash2, AlertTriangle, Edit } from 'lucide-react';
import TableGrid from './TableGrid';
import InfoModal from './InfoModal';

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState(false);
  const [reservationDetail, setReservationDetail] = useState<Reservation | null>(null); // nový stav

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await getReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservation: Reservation) => {
    setProcessing(reservation.id);
    try {
      await updateReservation(reservation.id, { status: 'approved' });
      await updateTables(reservation.tableIds, { 
        status: 'reserved', // Stoly se stanou rezervované
        reservationId: reservation.id 
      });
      await sendApprovalEmail(reservation.email, reservation.firstName, reservation.lastName, true, reservation.tableIds);
      await loadReservations();
    } catch (error) {
      console.error('Error approving reservation:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (reservation: Reservation) => {
    setProcessing(reservation.id);
    try {
      await updateReservation(reservation.id, { status: 'rejected' });
      await updateTables(reservation.tableIds, { 
        status: 'blocked', // Vrátíme na výchozí stav
        reservationId: undefined 
      });
      await sendApprovalEmail(reservation.email, reservation.firstName, reservation.lastName, false, reservation.tableIds);
      await loadReservations();
    } catch (error) {
      console.error('Error rejecting reservation:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (reservationId: string) => {
    if (!confirm('Opravdu chcete smazat tuto rezervaci?')) return;
    
    setProcessing(reservationId);
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (reservation && reservation.status === 'approved') {
        await sendCancelledEmail(reservation.email, reservation.firstName, reservation.lastName, reservation.tableIds);
      }
      await deleteReservation(reservationId);
      await loadReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Opravdu chcete smazat všechny rezervace? Tato akce je nevratná!')) return;
    
    setProcessing('all');
    try {
      await deleteAllReservations();
      await loadReservations();
    } catch (error) {
      console.error('Error deleting all reservations:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleEditTable = async (table: Table) => {
    try {
      await updateTable(table.id, { status: table.status });
      // Přenačteme data pro aktualizaci UI
      await loadReservations();
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const handleResetTables = async () => {
    if (!confirm('Opravdu chcete resetovat všechny tabulky na výchozí stav? Tato akce je nevratná!')) return;
    
    setProcessing('reset');
    try {
      await resetTables();
      await loadReservations();
    } catch (error) {
      console.error('Error resetting tables:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Funkce pro zobrazení detailu rezervace podle tableId
  const handleTableReservationClick = (tableId: string) => {
    const found = reservations.find(r => r.tableIds.includes(tableId));
    if (found) setReservationDetail(found);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-black">
      <div className="flex flex-wrap gap-2 gap-y-3 items-center justify-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-black w-full text-center sm:w-auto sm:text-left">Administrace rezervací</h1>
        <div className="flex flex-wrap gap-2 w-full justify-center sm:w-auto sm:justify-end">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0113.5-5.303M4.5 12V7.5m0 4.5h4.5m10.5 0a7.5 7.5 0 01-13.5 5.303M19.5 12v4.5m0-4.5h-4.5" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setEditorMode((v) => !v)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${editorMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'} hover:bg-blue-700 hover:text-white`}
          >
            <Edit className="h-4 w-4" />
            Editor
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={processing === 'all' || reservations.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Smazat všechny</span>
          </button>
          <button
            onClick={handleResetTables}
            disabled={processing === 'reset'}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Reset tabulek</span>
          </button>
        </div>
      </div>

      <TableGrid
        onTableSelect={() => {}}
        selectedTables={[]}
        isAdmin={true}
        editorMode={editorMode}
        onEditTable={handleEditTable}
        onTableReservationClick={handleTableReservationClick}
        // nový prop
      />
      <div className="mb-8" />

      {reservations.length === 0 ? (
        <div className="text-center py-12 text-black">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Žádné rezervace nebyly nalezeny</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-black"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-black">
                      {reservation.firstName} {reservation.lastName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {reservation.status === 'pending' ? 'Čeká na schválení' :
                       reservation.status === 'approved' ? 'Schváleno' :
                       reservation.status === 'rejected' ? 'Zamítnuto' : reservation.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Telefon:</strong> {reservation.phone}</p>
                      <p><strong>E-mail:</strong> {reservation.email}</p>
                    </div>
                    <div>
                      <p><strong>Stoly:</strong> {reservation.tableIds.length}</p>
                      <p><strong>Vytvořeno:</strong> {reservation.createdAt.toLocaleString('cs-CZ')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {reservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(reservation)}
                        disabled={processing === reservation.id}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        title="Schválit"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(reservation)}
                        disabled={processing === reservation.id}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        title="Zamítnout"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(reservation.id)}
                    disabled={processing === reservation.id}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    title="Smazat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal s detailem rezervace */}
      {reservationDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
            <h2 className="text-2xl font-bold mb-4 text-center text-black">Detail rezervace</h2>
            <div className="mb-2"><strong>Jméno:</strong> <span className="text-black">{reservationDetail.firstName} {reservationDetail.lastName}</span></div>
            <div className="mb-2"><strong>E-mail:</strong> {reservationDetail.email}</div>
            <div className="mb-2"><strong>Telefon:</strong> {reservationDetail.phone}</div>
            <div className="mb-2"><strong>Stoly:</strong> {reservationDetail.tableIds.join(', ')}</div>
            <div className="mb-2"><strong>Vytvořeno:</strong> {reservationDetail.createdAt.toLocaleString('cs-CZ')}</div>
            <div className="mb-2"><strong>Status:</strong> {reservationDetail.status}</div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full" onClick={() => setReservationDetail(null)}>Zavřít</button>
          </div>
        </div>
      )}
    </div>
  );
} 