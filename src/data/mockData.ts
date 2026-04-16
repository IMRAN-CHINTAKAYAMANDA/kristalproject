export const mockUser = {
  id: '1',
  username: 'admin',
  fullName: 'System Administrator',
  role: 'Admin' as const,
  baseId: undefined,
  baseName: undefined
};

export const mockUsers = [
  {
    id: '1',
    username: 'admin',
    fullName: 'System Administrator',
    role: 'Admin' as const,
    baseId: undefined,
    baseName: undefined
  },
  {
    id: '2',
    username: 'commander',
    fullName: 'Colonel Sarah Mitchell',
    role: 'Base Commander' as const,
    baseId: 'base1',
    baseName: 'Fort Henderson'
  },
  {
    id: '3',
    username: 'logistics',
    fullName: 'Major James Rodriguez',
    role: 'Logistics Officer' as const,
    baseId: 'base1',
    baseName: 'Fort Henderson'
  }
];

export const mockBases = [
  { id: 'base1', name: 'Fort Henderson', location: 'Texas' },
  { id: 'base2', name: 'Camp Liberty', location: 'Georgia' },
  { id: 'base3', name: 'Naval Air Station', location: 'California' },
  { id: 'base4', name: 'Mountain View Base', location: 'Colorado' }
];

export const mockEquipmentTypes = [
  { id: 'vehicles', name: 'Vehicles', category: 'Ground' },
  { id: 'small-arms', name: 'Small Arms', category: 'Weapons' },
  { id: 'ammunition', name: 'Ammunition', category: 'Consumable' },
  { id: 'heavy-weapons', name: 'Heavy Weapons', category: 'Weapons' },
  { id: 'communication', name: 'Communication Equipment', category: 'Electronics' },
  { id: 'medical', name: 'Medical Supplies', category: 'Consumable' }
];

export const mockDashboardData = {
  openingBalance: 15420,
  closingBalance: 16180,
  netMovement: 760,
  assignedAssets: 3240,
  expendedAssets: 890,
  recentTransfers: [
    { asset: 'M4A1 Rifles', from: 'Fort Henderson', to: 'Camp Liberty', quantity: '25', date: '2024-01-15' },
    { asset: '5.56mm Ammunition', from: 'Camp Liberty', to: 'Naval Air Station', quantity: '5000 rounds', date: '2024-01-14' },
    { asset: 'Humvees', from: 'Mountain View Base', to: 'Fort Henderson', quantity: '3', date: '2024-01-13' },
    { asset: 'Night Vision Goggles', from: 'Naval Air Station', to: 'Camp Liberty', quantity: '12', date: '2024-01-12' }
  ],
  assetStatus: [
    { base: 'Fort Henderson', operational: 245, total: 280 },
    { base: 'Camp Liberty', operational: 189, total: 210 },
    { base: 'Naval Air Station', operational: 156, total: 175 },
    { base: 'Mountain View Base', operational: 134, total: 150 }
  ],
  netMovementDetails: {
    purchases: [
      { id: '1', asset: 'M4A1 Rifles', quantity: 50, date: '2024-01-10', cost: 75000 },
      { id: '2', asset: '5.56mm Ammunition', quantity: 10000, date: '2024-01-08', cost: 25000 },
      { id: '3', asset: 'Body Armor Vests', quantity: 30, date: '2024-01-05', cost: 45000 }
    ],
    transfersIn: [
      { id: '1', asset: 'Night Vision Goggles', quantity: 15, date: '2024-01-12', source: 'Central Supply' },
      { id: '2', asset: 'Humvees', quantity: 2, date: '2024-01-09', source: 'Fort Liberty' },
      { id: '3', asset: 'Medical Kits', quantity: 25, date: '2024-01-07', source: 'Regional Hospital' }
    ],
    transfersOut: [
      { id: '1', asset: 'M4A1 Rifles', quantity: 25, date: '2024-01-15', destination: 'Camp Liberty' },
      { id: '2', asset: '5.56mm Ammunition', quantity: 3000, date: '2024-01-11', destination: 'Training Center' },
      { id: '3', asset: 'Tactical Radios', quantity: 8, date: '2024-01-06', destination: 'Field Unit Alpha' }
    ]
  }
};

export const mockPurchases = [
  {
    id: '1',
    equipmentType: 'Small Arms',
    assetName: 'M4A1 Carbine',
    quantity: 50,
    unitCost: 1500,
    totalCost: 75000,
    supplier: 'Colt Defense LLC',
    receivingBase: 'Fort Henderson',
    purchaseOrderNumber: 'PO-2024-001',
    date: '2024-01-10',
    notes: 'Standard issue rifles for infantry units'
  },
  {
    id: '2',
    equipmentType: 'Ammunition',
    assetName: '5.56mm NATO Ball',
    quantity: 10000,
    unitCost: 2.50,
    totalCost: 25000,
    supplier: 'Federal Premium',
    receivingBase: 'Fort Henderson',
    purchaseOrderNumber: 'PO-2024-002',
    date: '2024-01-08',
    notes: 'Training and operational ammunition'
  },
  {
    id: '3',
    equipmentType: 'Vehicles',
    assetName: 'HMMWV M1151',
    quantity: 3,
    unitCost: 180000,
    totalCost: 540000,
    supplier: 'AM General',
    receivingBase: 'Camp Liberty',
    purchaseOrderNumber: 'PO-2024-003',
    date: '2024-01-05',
    notes: 'Up-armored utility vehicles'
  }
];

export const mockTransfers = [
  {
    id: '1',
    equipmentType: 'Small Arms',
    assetName: 'M4A1 Rifles',
    quantity: 25,
    sourceBase: 'Fort Henderson',
    destinationBase: 'Camp Liberty',
    status: 'Completed',
    initiatedBy: 'Major Rodriguez',
    date: '2024-01-15',
    reason: 'Unit deployment support'
  },
  {
    id: '2',
    equipmentType: 'Vehicles',
    assetName: 'Humvees',
    quantity: 2,
    sourceBase: 'Mountain View Base',
    destinationBase: 'Fort Henderson',
    status: 'In Transit',
    initiatedBy: 'Captain Williams',
    date: '2024-01-13',
    reason: 'Maintenance rotation'
  },
  {
    id: '3',
    equipmentType: 'Communication Equipment',
    assetName: 'Tactical Radios',
    quantity: 12,
    sourceBase: 'Naval Air Station',
    destinationBase: 'Camp Liberty',
    status: 'Pending',
    initiatedBy: 'Lt. Commander Davis',
    date: '2024-01-16',
    reason: 'Exercise preparation'
  }
];

export const mockAssignments = [
  {
    id: '1',
    equipmentType: 'Small Arms',
    assetName: 'M4A1 Carbine',
    assetId: 'SA-2024-001',
    assignedTo: 'Sergeant Johnson',
    base: 'Fort Henderson',
    purpose: 'Standard issue for patrol duty',
    assignmentDate: '2024-01-10',
    expectedReturnDate: '2024-06-10',
    status: 'Active'
  },
  {
    id: '2',
    equipmentType: 'Communication Equipment',
    assetName: 'PRC-152 Radio',
    assetId: 'CE-2024-045',
    assignedTo: 'Corporal Martinez',
    base: 'Camp Liberty',
    purpose: 'Communications for training exercise',
    assignmentDate: '2024-01-12',
    expectedReturnDate: '2024-01-20',
    status: 'Active'
  },
  {
    id: '3',
    equipmentType: 'Vehicles',
    assetName: 'HMMWV',
    assetId: 'VH-2024-012',
    assignedTo: 'Staff Sergeant Brown',
    base: 'Naval Air Station',
    purpose: 'Base security patrol',
    assignmentDate: '2024-01-08',
    expectedReturnDate: '2024-03-08',
    status: 'Active'
  }
];

export const mockExpendatures = [
  {
    id: '1',
    equipmentType: 'Ammunition',
    assetName: '5.56mm NATO',
    quantity: 500,
    base: 'Fort Henderson',
    reason: 'Training',
    date: '2024-01-14',
    reportedBy: 'Sergeant Wilson'
  },
  {
    id: '2',
    equipmentType: 'Medical Supplies',
    assetName: 'First Aid Kits',
    quantity: 12,
    base: 'Camp Liberty',
    reason: 'Training Exercise',
    date: '2024-01-12',
    reportedBy: 'Medic Thompson'
  },
  {
    id: '3',
    equipmentType: 'Ammunition',
    assetName: '9mm Parabellum',
    quantity: 200,
    base: 'Naval Air Station',
    reason: 'Qualification Training',
    date: '2024-01-11',
    reportedBy: 'Petty Officer Lee'
  }
];