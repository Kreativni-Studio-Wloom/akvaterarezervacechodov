'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';

export default function InfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 z-50"
        title="Informace o aplikaci"
      >
        <Info className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Informace o aplikaci</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Jak rezervovat stoly:</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Klikněte na volné stoly (tmavě modré)</li>
                  <li>Vyplňte formulář s kontaktními údaji</li>
                  <li>Potvrďte rezervaci</li>
                  <li>Počkejte na e-mail s potvrzením</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Typy stolů:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• <span className="font-medium">Tmavě modré:</span> Volné stoly</li>
                  <li>• <span className="font-medium">Světle modré:</span> Rezervované stoly</li>
                  <li>• <span className="font-medium">Modré:</span> Permanentně rezervované</li>
                  <li>• <span className="font-medium">Zelené:</span> Vchod</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Pro administrátory:</h3>
                <p className="text-gray-600">
                  Klikněte na "Admin" v hlavním menu pro přístup k administraci rezervací.
                </p>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Aplikace pro rezervaci stolů na burze<br />
                  Vytvořeno s Next.js, Firebase a SendGrid
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 