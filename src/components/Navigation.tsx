import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ArrowRightLeft, 
  Users, 
  UserCog,
  Home
} from 'lucide-react';
import { PageType, UserRole } from '../App';

interface NavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  userRole: UserRole;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, userRole }) => {
  const navigationItems = [
    {
      id: 'dashboard' as PageType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Base Commander', 'Logistics Officer']
    },
    {
      id: 'purchases' as PageType,
      label: 'Purchases',
      icon: ShoppingCart,
      roles: ['Admin', 'Logistics Officer']
    },
    {
      id: 'transfers' as PageType,
      label: 'Transfers',
      icon: ArrowRightLeft,
      roles: ['Admin', 'Base Commander', 'Logistics Officer']
    },
    {
      id: 'assignments' as PageType,
      label: 'Assignments & Expenditures',
      icon: Users,
      roles: ['Admin', 'Base Commander', 'Logistics Officer']
    },
    {
      id: 'users' as PageType,
      label: 'User Management',
      icon: UserCog,
      roles: ['Admin']
    }
  ];

  const accessibleItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <nav className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900 text-white overflow-y-auto">
      <div className="p-4">
        <div className="space-y-2">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2 text-slate-400">
          <Home className="h-4 w-4" />
          <span className="text-sm">Secure Military Network</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;