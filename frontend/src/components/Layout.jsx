import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppBar from './AppBar';
import BottomNav from './BottomNav';
import NavDrawer from './NavDrawer';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/schedule': "Today's Schedule",
  '/patients': 'Patients',
  '/calendar': 'Calendar',
  '/clinical-search': 'Clinical Search',
  '/profile': 'Profile',
  '/about': 'About',
};

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isDetailPage = /^\/patients\/\d+/.test(location.pathname);
  const showBottomNav = !isDetailPage;
  const showAppBarSearch = !isDetailPage && location.pathname !== '/';

  const getTitle = () => {
    if (isDetailPage) return 'Patient Details';
    const base = location.pathname.split('/').slice(0, 2).join('/') || location.pathname;
    if (PAGE_TITLES[location.pathname]) return PAGE_TITLES[location.pathname];
    if (location.pathname.startsWith('/patients/') && location.pathname.includes('/visits/')) {
      return 'Visit Details';
    }
    return PAGE_TITLES[base] || 'EMR System';
  };

  return (
    <div className="app-shell">
      {!isDetailPage && (
        <AppBar
          title={getTitle()}
          onMenuClick={() => setDrawerOpen(true)}
          showSearch={showAppBarSearch}
        />
      )}

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className={`shell-content${showBottomNav ? ' with-bottom-nav' : ''}`}>
        <Outlet context={{ openDrawer: () => setDrawerOpen(true) }} />
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
