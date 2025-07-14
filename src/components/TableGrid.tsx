'use client';

import { useState, useEffect } from 'react';
import { Table, Reservation } from '@/types';
import { getTables, getReservations, addTable } from '@/lib/services';

interface TableGridProps {
  onTableSelect: (tableIds: string[]) => void;
  selectedTables: string[];
  isAdmin?: boolean;
  editorMode?: boolean;
  onEditTable?: (table: Table) => void;
  onTableReservationClick?: (tableId: string) => void; // nový prop
}

const getTableColor = (table: Table, reservations: Reservation[]) => {
  // Kontrolujeme, zda má stůl čekající rezervaci
  const hasPendingReservation = reservations.some(r => 
    r.tableIds.includes(table.id) && r.status === 'pending'
  );
  
  // Kontrolujeme, zda má stůl schválenou rezervaci
  const hasApprovedReservation = reservations.some(r => 
    r.tableIds.includes(table.id) && r.status === 'approved'
  );
  
  if (hasApprovedReservation) {
    return 'bg-red-200 cursor-not-allowed'; // Světle červené pro schválené rezervace
  }
  
  if (hasPendingReservation) {
    return 'bg-blue-400 hover:bg-blue-500'; // Modrý s jiným odstínem pro čekající rezervace
  }
  
  switch (table.status) {
    case 'available':
      return 'bg-blue-600 hover:bg-blue-700';
    case 'reserved':
      return 'bg-red-200 cursor-not-allowed'; // Světle červené pro rezervované stoly
    case 'blocked':
      return 'bg-white text-gray-400 border-gray-200';
    case 'permanent':
      return 'bg-gray-400 cursor-not-allowed'; // Šedá pro permanentně rezervované
    case 'entrance':
      return 'bg-green-500 cursor-not-allowed';
    default:
      return 'bg-gray-300';
  }
};

const getTableTooltip = (table: Table, reservations: Reservation[]) => {
  if (table.status === 'entrance') return 'Vchod';
  if (table.status === 'permanent') return 'Permanentně rezervováno';
  
  const reservation = reservations.find(r => r.tableIds.includes(table.id));
  if (reservation) {
    return `${reservation.firstName} ${reservation.lastName}\n${reservation.phone}\n${reservation.email}\nStatus: ${reservation.status}`;
  }
  
  return 'Volný stůl';
};

export default function TableGrid({ onTableSelect, selectedTables, isAdmin = false, editorMode = false, onEditTable, onTableReservationClick }: TableGridProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{table: Table, open: boolean} | null>(null);
  const [addDialog, setAddDialog] = useState<{x: number, y: number, open: boolean} | null>(null);
  // Multi-select stav pro editor
  const [editorSelected, setEditorSelected] = useState<string[]>([]);
  const [emptySelected, setEmptySelected] = useState<{x: number, y: number}[]>([]);
  const [dragSelecting, setDragSelecting] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [bulkDialog, setBulkDialog] = useState<boolean>(false);
  const [bulkAddDialog, setBulkAddDialog] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tablesData, reservationsData] = await Promise.all([
          getTables(),
          getReservations()
        ]);
        setTables(tablesData);
        setReservations(reservationsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Pomocná funkce pro získání ID tabulky podle souřadnic
  const getTableIdByXY = (x: number, y: number) => {
    const table = tables.find(t => t.x === x && t.y === y);
    return table ? table.id : null;
  };

  // Multi-select klikáním v editoru
  const handleEditorTableClick = (table: Table) => {
    if (!editorMode) return;
    setEditorSelected(prev =>
      prev.includes(table.id)
        ? prev.filter(id => id !== table.id)
        : [...prev, table.id]
    );
  };

  // Multi-select klikáním na prázdnou buňku
  const handleEmptyCellClick = (x: number, y: number) => {
    if (!editorMode) return;
    setEmptySelected(prev => {
      const exists = prev.some(pos => pos.x === x && pos.y === y);
      if (exists) {
        return prev.filter(pos => !(pos.x === x && pos.y === y));
      } else {
        return [...prev, {x, y}];
      }
    });
  };

  // Drag select začátek
  const handleMouseDown = (x: number, y: number, isEmpty: boolean) => {
    if (!editorMode) return;
    setDragSelecting(true);
    setDragStart({ x, y });
    if (isEmpty) {
      setEmptySelected([{x, y}]);
      setEditorSelected([]);
    } else {
      setEditorSelected([]);
      setEmptySelected([]);
    }
  };

  // Drag select průběh
  const handleMouseEnter = (x: number, y: number, isEmpty: boolean) => {
    if (!editorMode || !dragSelecting || !dragStart) return;
    const x1 = Math.min(dragStart.x, x);
    const x2 = Math.max(dragStart.x, x);
    const y1 = Math.min(dragStart.y, y);
    const y2 = Math.max(dragStart.y, y);
    if (isEmpty) {
      const selected: {x: number, y: number}[] = [];
      for (let yy = y1; yy <= y2; yy++) {
        for (let xx = x1; xx <= x2; xx++) {
          // Pokud není stůl na této pozici
          const table = tables.find(t => t.x === xx && t.y === yy);
          if (!table) selected.push({x: xx, y: yy});
        }
      }
      setEmptySelected(selected);
      setEditorSelected([]);
    } else {
      const selected: string[] = [];
      for (let yy = y1; yy <= y2; yy++) {
        for (let xx = x1; xx <= x2; xx++) {
          const table = tables.find(t => t.x === xx && t.y === yy);
          if (table) selected.push(table.id);
        }
      }
      setEditorSelected(selected);
      setEmptySelected([]);
    }
  };

  // Drag select konec
  const handleMouseUp = () => {
    if (!editorMode) return;
    setDragSelecting(false);
    setDragStart(null);
  };

  // Hromadná změna stavu existujících stolů
  const handleBulkStatus = async (status: Table['status']) => {
    if (editorSelected.length === 0) return;
    const { updateTables } = await import('@/lib/services');
    await updateTables(editorSelected, { status });
    setTables(prev => prev.map(t =>
      editorSelected.includes(t.id) ? { ...t, status } : t
    ));
    setBulkDialog(false);
    setEditorSelected([]);
  };

  // Hromadné přidání nových stolů
  const handleBulkAdd = async (status: Table['status']) => {
    if (emptySelected.length === 0) return;
    const { addTable } = await import('@/lib/services');
    const newTables: Table[] = emptySelected.map(({x, y}) => ({
      id: `${x}-${y}`,
      x,
      y,
      status
    }));
    await Promise.all(newTables.map(t => addTable(t)));
    setTables(prev => [...prev, ...newTables]);
    setBulkAddDialog(false);
    setEmptySelected([]);
  };

  const handleTableClick = (table: Table) => {
    if (editorMode) {
      setEditDialog({ table, open: true });
      return;
    }
    if (isAdmin) {
      // Pokud je admin a stůl je rezervovaný, zobraz detail rezervace
      if (table.status === 'reserved' || table.status === 'permanent' || reservations.some(r => r.tableIds.includes(table.id))) {
        onTableReservationClick && onTableReservationClick(table.id);
      }
      return;
    }
    // Kontrolujeme, zda má stůl schválenou rezervaci (ne čekající)
    const hasApprovedReservation = reservations.some(r => 
      r.tableIds.includes(table.id) && r.status === 'approved'
    );
    // Nelze vybrat stoly, které mají schválenou rezervaci
    if (table.status === 'available' && !hasApprovedReservation) {
      const newSelected = selectedTables.includes(table.id)
        ? selectedTables.filter(id => id !== table.id)
        : [...selectedTables, table.id];
      onTableSelect(newSelected);
    }
  };

  const handleEditStatus = async (status: Table['status']) => {
    if (editDialog && onEditTable) {
      const updatedTable = { ...editDialog.table, status };
      await onEditTable(updatedTable);
      
      // Aktualizujeme lokální stav
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === updatedTable.id ? updatedTable : table
        )
      );
    }
    setEditDialog(null);
  };

  // Přidání nového stolu
  const handleAddTable = async (x: number, y: number, status: Table['status']) => {
    const newTable: Table = {
      id: `${x}-${y}`,
      x,
      y,
      status
    };
    await addTable(newTable);
    setTables(prev => [...prev, newTable]);
    setAddDialog(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vytvoříme grid 24x16 podle zadání
  const gridWidth = 24;
  const gridHeight = 16;
  const grid = Array.from({ length: gridHeight }, (_, y) =>
    Array.from({ length: gridWidth }, (_, x) => {
      const table = tables.find(t => t.x === x && t.y === y);
      return table || null;
    })
  );

  // --- UI ---
  return (
    <div className="w-full max-w-full mx-auto px-1 sm:px-4 overflow-x-auto select-none" onMouseUp={handleMouseUp}>
      <div
        className="inline-block"
        style={{ minWidth: gridWidth * 28, maxWidth: '100vw' }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridWidth}, minmax(20px, 1fr))`,
            width: gridWidth * 28,
            maxWidth: '100vw',
            margin: '0 auto',
          }}
        >
          {grid.flat().map((table, idx) => {
            const x = idx % gridWidth;
            const y = Math.floor(idx / gridWidth);
            if (table) {
              return (
                <div
                  key={table.id}
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-none flex items-center justify-center text-[10px] sm:text-xs font-bold text-black
                    ${getTableColor(table, reservations)}
                    ${table.status === 'available' && !isAdmin && !editorMode ? 'cursor-pointer' : ''}
                    ${editorMode ? 'cursor-pointer ring-2 ring-blue-400' : ''}
                    ${editorMode && editorSelected.includes(table.id) ? 'ring-4 ring-yellow-400' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => editorMode ? handleEditorTableClick(table) : handleTableClick(table)}
                  onMouseDown={() => handleMouseDown(x, y, false)}
                  onMouseEnter={() => handleMouseEnter(x, y, false)}
                  title={getTableTooltip(table, reservations)}
                  style={{border: '1px solid #222'}}
                >
                  {table.status === 'entrance' ? 'V' : 
                   table.status === 'permanent' ? '' : 
                   (editorMode && editorSelected.includes(table.id)) ? '✓' :
                   selectedTables.includes(table.id) ? '✓' : ''}
                </div>
              );
            }
            const isSelected = editorMode && emptySelected.some(pos => pos.x === x && pos.y === y);
            return (
              <div key={idx} className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-transparent ${editorMode ? 'cursor-pointer ring-2 ring-green-400' : ''} ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
                onClick={() => editorMode ? handleEmptyCellClick(x, y) : undefined}
                onMouseDown={() => editorMode ? handleMouseDown(x, y, true) : undefined}
                onMouseEnter={() => editorMode ? handleMouseEnter(x, y, true) : undefined}
              />
            );
          })}
        </div>
      </div>
      {/* Hromadná změna stavu */}
      {editorMode && editorSelected.length > 0 && (
        <div className="mb-2 flex gap-2 items-center">
          <span className="font-semibold">Vybráno: {editorSelected.length}</span>
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setBulkDialog(true)}>
            Nastavit status
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setEditorSelected([])}>
            Zrušit výběr
          </button>
        </div>
      )}
      {/* Hromadné přidání nových polí */}
      {editorMode && emptySelected.length > 0 && (
        <div className="mb-2 flex gap-2 items-center">
          <span className="font-semibold">Vybráno prázdných: {emptySelected.length}</span>
          <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => setBulkAddDialog(true)}>
            Přidat pole
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setEmptySelected([])}>
            Zrušit výběr
          </button>
        </div>
      )}
      {/* Dialog pro přidání nového pole */}
      {addDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">Přidat nové pole ({String.fromCharCode(65+addDialog.x)}{addDialog.y+1})</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => handleAddTable(addDialog.x, addDialog.y, 'available')}>Rezervovatelné</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => handleAddTable(addDialog.x, addDialog.y, 'blocked')}>Nerezervovatelné</button>
            <button className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => handleAddTable(addDialog.x, addDialog.y, 'permanent')}>Permanentně rezervované</button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => handleAddTable(addDialog.x, addDialog.y, 'entrance')}>Vchod</button>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={() => setAddDialog(null)}>Zrušit</button>
          </div>
        </div>
      )}

      {/* Dialog pro úpravu jednoho pole */}
      {editDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">Upravit pole ({String.fromCharCode(65+editDialog.table.x)}{editDialog.table.y+1})</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => handleEditStatus('available')}>Rezervovatelné</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => handleEditStatus('blocked')}>Nerezervovatelné</button>
            <button className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => handleEditStatus('permanent')}>Permanentně rezervované</button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => handleEditStatus('entrance')}>Vchod</button>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={() => setEditDialog(null)}>Zrušit</button>
          </div>
        </div>
      )}

      {/* Dialog pro hromadnou změnu stavu */}
      {bulkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">Nastavit status ({editorSelected.length} polí)</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => handleBulkStatus('available')}>Rezervovatelné</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => handleBulkStatus('blocked')}>Nerezervovatelné</button>
            <button className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => handleBulkStatus('permanent')}>Permanentně rezervované</button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => handleBulkStatus('entrance')}>Vchod</button>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={() => setBulkDialog(false)}>Zrušit</button>
          </div>
        </div>
      )}
      {/* Dialog pro hromadné přidání nových polí */}
      {bulkAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">Přidat {emptySelected.length} nových polí</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => handleBulkAdd('available')}>Rezervovatelné</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => handleBulkAdd('blocked')}>Nerezervovatelné</button>
            <button className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => handleBulkAdd('permanent')}>Permanentně rezervované</button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => handleBulkAdd('entrance')}>Vchod</button>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={() => setBulkAddDialog(false)}>Zrušit</button>
          </div>
        </div>
      )}
    </div>
  );
} 