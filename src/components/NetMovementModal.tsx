import React from 'react';
import { X, TrendingUp, TrendingDown, ShoppingCart, ArrowRightLeft } from 'lucide-react';

interface NetMovementDetail {
  purchases: Array<{
    id: string | number;
    asset: string;
    quantity: number;
    date: string;
    cost: number;
  }>;
  transfersIn: Array<{
    id: string | number;
    asset: string;
    quantity: number;
    date: string;
    source: string;
  }>;
  transfersOut: Array<{
    id: string | number;
    asset: string;
    quantity: number;
    date: string;
    destination: string;
  }>;
}

interface NetMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: NetMovementDetail;
}

const NetMovementModal: React.FC<NetMovementModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const totalPurchases = data.purchases.reduce((sum, p) => sum + p.quantity, 0);
  const totalTransfersIn = data.transfersIn.reduce((sum, t) => sum + t.quantity, 0);
  const totalTransfersOut = data.transfersOut.reduce((sum, t) => sum + t.quantity, 0);
  const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-50" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                netMovement > 0 ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {netMovement > 0 ? (
                  <TrendingUp className="h-5 w-5 text-white" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Net Movement Breakdown</h3>
                <p className="text-gray-600">Detailed view of asset movements</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Purchases</span>
              </div>
              <p className="text-2xl font-bold text-green-900">+{totalPurchases}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Transfers In</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">+{totalTransfersIn}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowRightLeft className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Transfers Out</span>
              </div>
              <p className="text-2xl font-bold text-red-900">-{totalTransfersOut}</p>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              netMovement > 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {netMovement > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  netMovement > 0 ? 'text-green-800' : 'text-red-800'
                }`}>Net Movement</span>
              </div>
              <p className={`text-2xl font-bold ${
                netMovement > 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {netMovement > 0 ? '+' : ''}{netMovement}
              </p>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Purchases */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Purchases</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.purchases.map((purchase) => (
                  <div key={purchase.id} className="bg-white p-3 rounded border text-sm">
                    <p className="font-medium text-gray-900">{purchase.asset}</p>
                    <p className="text-gray-600">Qty: {purchase.quantity}</p>
                    <p className="text-gray-500 text-xs">{purchase.date}</p>
                    <p className="text-green-600 font-medium">${purchase.cost.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfers In */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Transfers In</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.transfersIn.map((transfer) => (
                  <div key={transfer.id} className="bg-white p-3 rounded border text-sm">
                    <p className="font-medium text-gray-900">{transfer.asset}</p>
                    <p className="text-gray-600">Qty: {transfer.quantity}</p>
                    <p className="text-blue-600 text-xs">From: {transfer.source}</p>
                    <p className="text-gray-500 text-xs">{transfer.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfers Out */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Transfers Out</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.transfersOut.map((transfer) => (
                  <div key={transfer.id} className="bg-white p-3 rounded border text-sm">
                    <p className="font-medium text-gray-900">{transfer.asset}</p>
                    <p className="text-gray-600">Qty: {transfer.quantity}</p>
                    <p className="text-red-600 text-xs">To: {transfer.destination}</p>
                    <p className="text-gray-500 text-xs">{transfer.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetMovementModal;
