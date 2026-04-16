import type { User } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
const TOKEN_KEY = 'mams_token';

export interface Base {
  id: string;
  name: string;
  location: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  category: string;
}

export interface Purchase {
  id: number;
  equipmentType: string;
  assetName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  receivingBase: string;
  purchaseOrderNumber: string;
  date: string;
  notes?: string;
}

export interface Transfer {
  id: number;
  equipmentType: string;
  assetName: string;
  quantity: number;
  sourceBase: string;
  destinationBase: string;
  status: string;
  initiatedBy: string;
  date: string;
  reason: string;
  notes?: string;
}

export interface Assignment {
  id: number;
  equipmentType: string;
  assetName: string;
  assetId: string;
  assignedTo: string;
  base: string;
  purpose: string;
  assignmentDate: string;
  expectedReturnDate?: string;
  status: string;
  notes?: string;
}

export interface Expenditure {
  id: number;
  equipmentType: string;
  assetName: string;
  quantity: number;
  base: string;
  reason: string;
  date: string;
  reportedBy: string;
  notes?: string;
}

export interface DashboardData {
  openingBalance: number;
  closingBalance: number;
  netMovement: number;
  assignedAssets: number;
  expendedAssets: number;
  recentTransfers: Array<{
    asset: string;
    from: string;
    to: string;
    quantity: number;
    date: string;
  }>;
  assetStatus: Array<{
    base: string;
    operational: number;
    total: number;
  }>;
  netMovementDetails: {
    purchases: Array<{ id: number; asset: string; quantity: number; date: string; cost: number }>;
    transfersIn: Array<{ id: number; asset: string; quantity: number; date: string; source: string }>;
    transfersOut: Array<{ id: number; asset: string; quantity: number; date: string; destination: string }>;
  };
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  async login(username: string, password: string) {
    const data = await request<{ token: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    return data.user;
  },
  async logout() {
    await request('/api/logout', { method: 'POST' }).catch(() => undefined);
    clearToken();
  },
  me: () => request<{ user: User }>('/api/me'),
  meta: () => request<{ bases: Base[]; equipmentTypes: EquipmentType[] }>('/api/meta'),
  dashboard: (filters: { dateRange: string; base: string; equipmentType: string }) => {
    const params = new URLSearchParams(filters);
    return request<DashboardData>(`/api/dashboard?${params.toString()}`);
  },
  purchases: () => request<Purchase[]>('/api/purchases'),
  createPurchase: (payload: Record<string, unknown>) =>
    request('/api/purchases', { method: 'POST', body: JSON.stringify(payload) }),
  transfers: () => request<Transfer[]>('/api/transfers'),
  createTransfer: (payload: Record<string, unknown>) =>
    request('/api/transfers', { method: 'POST', body: JSON.stringify(payload) }),
  assignments: () => request<Assignment[]>('/api/assignments'),
  createAssignment: (payload: Record<string, unknown>) =>
    request('/api/assignments', { method: 'POST', body: JSON.stringify(payload) }),
  expenditures: () => request<Expenditure[]>('/api/expenditures'),
  createExpenditure: (payload: Record<string, unknown>) =>
    request('/api/expenditures', { method: 'POST', body: JSON.stringify(payload) }),
  users: () => request<User[]>('/api/users'),
  createUser: (payload: Record<string, unknown>) =>
    request('/api/users', { method: 'POST', body: JSON.stringify(payload) }),
};
