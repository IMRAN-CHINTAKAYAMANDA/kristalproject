import React from 'react';
import { User, LogOut, Shield } from 'lucide-react';
import { User as UserType } from '../App';

interface HeaderProps {
  currentUser: UserType;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Base Commander':
        return 'bg-blue-100 text-blue-800';
      case 'Logistics Officer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Military Asset Management</h1>
            <p className="text-sm text-gray-600">Secure Asset Tracking System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser.fullName}</p>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
                {currentUser.baseName && (
                  <span className="text-xs text-gray-500">{currentUser.baseName}</span>
                )}
              </div>
            </div>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;