import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Transfers from './components/Transfers';
import Assignments from './components/Assignments';
import UserManagement from './components/UserManagement';
import Navigation from './components/Navigation';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import { api, getToken } from './services/api';

export type UserRole = 'Admin' | 'Base Commander' | 'Logistics Officer';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  baseId?: string;
  baseName?: string;
}

export type PageType = 'dashboard' | 'purchases' | 'transfers' | 'assignments' | 'users';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setIsLoadingSession(false);
      return;
    }

    api.me()
      .then(({ user }) => setCurrentUser(user))
      .catch(() => api.logout())
      .finally(() => setIsLoadingSession(false));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading secure session...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'purchases':
        return <Purchases currentUser={currentUser} />;
      case 'transfers':
        return <Transfers currentUser={currentUser} />;
      case 'assignments':
        return <Assignments currentUser={currentUser} />;
      case 'users':
        return <UserManagement currentUser={currentUser} />;
      default:
        return <Dashboard currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex">
        <Navigation 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          userRole={currentUser.role}
        />
        <main className="flex-1 ml-64">
          <div className="p-6">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
