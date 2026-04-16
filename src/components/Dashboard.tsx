import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  AlertTriangle,
  Calendar,
  Filter,
  Building2,
  LucideIcon
} from 'lucide-react';
import { User } from '../App';
import NetMovementModal from './NetMovementModal';
import { api, Base, DashboardData, EquipmentType } from '../services/api';

interface DashboardProps {
  currentUser: User;
}

const emptyDashboardData: DashboardData = {
  openingBalance: 0,
  closingBalance: 0,
  netMovement: 0,
  assignedAssets: 0,
  expendedAssets: 0,
  recentTransfers: [],
  assetStatus: [],
  netMovementDetails: {
    purchases: [],
    transfersIn: [],
    transfersOut: [],
  },
};

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [selectedDateRange, setSelectedDateRange] = useState('30');
  const [selectedBase, setSelectedBase] = useState('all');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('all');
  const [showNetMovementModal, setShowNetMovementModal] = useState(false);
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.meta()
      .then((meta) => {
        setBases(meta.bases);
        setEquipmentTypes(meta.equipmentTypes);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load filters'));
  }, []);

  useEffect(() => {
    setError('');
    setIsLoading(true);
    api.dashboard({
      dateRange: selectedDateRange,
      base: selectedBase,
      equipmentType: selectedEquipmentType,
    })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard'))
      .finally(() => setIsLoading(false));
  }, [selectedBase, selectedDateRange, selectedEquipmentType]);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color, 
    clickable = false,
    onClick 
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: LucideIcon;
    color: string;
    clickable?: boolean;
    onClick?: () => void;
  }) => (
    <div 
      className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 ${
        clickable ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-gray-500 mt-1">{change}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Command Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time asset overview for {currentUser.baseName || 'all bases'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>

          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Bases</option>
            {bases.map(base => (
              <option key={base.id} value={base.id}>{base.name}</option>
            ))}
          </select>

          <select
            value={selectedEquipmentType}
            onChange={(e) => setSelectedEquipmentType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Equipment Types</option>
            {equipmentTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-white p-4 rounded-xl shadow-sm border text-sm text-gray-600">
          Loading dashboard data...
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Opening Balance"
          value={data.openingBalance.toLocaleString()}
          change="Assets at period start"
          icon={Package}
          color="bg-blue-600"
        />
        <MetricCard
          title="Closing Balance"
          value={data.closingBalance.toLocaleString()}
          change="Current asset count"
          icon={Package}
          color="bg-green-600"
        />
        <MetricCard
          title="Net Movement"
          value={data.netMovement > 0 ? `+${data.netMovement}` : data.netMovement.toString()}
          change="Click for details"
          icon={data.netMovement > 0 ? TrendingUp : TrendingDown}
          color={data.netMovement > 0 ? "bg-green-600" : "bg-red-600"}
          clickable={true}
          onClick={() => setShowNetMovementModal(true)}
        />
        <MetricCard
          title="Assigned Assets"
          value={data.assignedAssets.toLocaleString()}
          change="Currently deployed"
          icon={Users}
          color="bg-purple-600"
        />
        <MetricCard
          title="Expended Assets"
          value={data.expendedAssets.toLocaleString()}
          change="Used this period"
          icon={AlertTriangle}
          color="bg-orange-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transfers</h3>
          <div className="space-y-3">
            {data.recentTransfers.map((transfer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transfer.asset}</p>
                    <p className="text-xs text-gray-600">{transfer.from} to {transfer.to}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{transfer.quantity}</p>
                  <p className="text-xs text-gray-500">{transfer.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Status Overview</h3>
          <div className="space-y-4">
            {data.assetStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{status.base}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(status.operational / status.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{status.operational}/{status.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Net Movement Modal */}
      {showNetMovementModal && (
        <NetMovementModal
          isOpen={showNetMovementModal}
          onClose={() => setShowNetMovementModal(false)}
          data={data.netMovementDetails}
        />
      )}
    </div>
  );
};

export default Dashboard;
