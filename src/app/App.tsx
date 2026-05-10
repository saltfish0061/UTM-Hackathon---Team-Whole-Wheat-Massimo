import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { AIInsights } from './components/AIInsights';
import { RemoteTools } from './components/RemoteTools';
import { FarmMap } from './components/FarmMap';
import { Alerts } from './components/Alerts';
import { BottomNav } from './components/BottomNav';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { SettingsCenter } from './components/SettingsCenter';
import { AuthPage } from './components/AuthPage';
import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { activeToolsCount, user, isSettingsOpen } = useAppContext();

  if (!user) {
    return (
      <div className="gs-app-root size-full bg-gray-50 text-gray-900">
        <AuthPage />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':   return <Dashboard />;
      case 'ai':     return <AIInsights />;
      case 'tools':  return <RemoteTools />;
      case 'map':    return <FarmMap />;
      case 'alerts': return <Alerts />;
      default:       return <Dashboard />;
    }
  };

  return (
    <div className="gs-app-root size-full bg-gray-50 text-gray-900 overflow-y-auto">
      <div className="max-w-md mx-auto min-h-full">
        {isSettingsOpen ? (
          <SettingsCenter />
        ) : (
          <>
            {renderScreen()}
            <BottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeToolsCount={activeToolsCount}
            />
          </>
        )}
      </div>
      <ThemeSwitcher />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
