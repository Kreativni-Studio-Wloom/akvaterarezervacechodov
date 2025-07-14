export default function TableLegend() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-black text-center">Plán stolů</h2>
      <div className="flex flex-wrap gap-4 text-sm text-black justify-center text-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-black">Volné stoly</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-200 rounded"></div>
          <span className="text-black">Rezervované stoly</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-black">Permanentně rezervované</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-black">Vchod</span>
        </div>
      </div>
    </div>
  );
} 