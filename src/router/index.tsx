import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminOverview from '../pages/admin/AdminOverview';
import AdminPlayers from '../pages/admin/AdminPlayers';
import AdminFixtures from '../pages/admin/AdminFixtures';
import AdminBlocks from '../pages/admin/AdminBlocks';
import AdminBlogs from '../pages/admin/AdminBlogs';
import AdminMenus from '../pages/admin/AdminMenus';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminFeatures from '../pages/admin/AdminFeatures';
import AdminPages from '../pages/admin/AdminPages';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminStats from '../pages/admin/AdminStats';
import AdminDrafts from '../pages/admin/AdminDrafts';
import AdminAds from '../pages/admin/AdminAds';
import AdminMiniLeagues from '../pages/admin/AdminMiniLeagues';

import Login from '../pages/public/Login';
import Portal from '../pages/public/Portal';
import FootballHome from '../pages/public/FootballHome';
import BasketballHome from '../pages/public/BasketballHome';
import DynamicPage from '../pages/public/DynamicPage';
import BasketballGuide from '../pages/public/BasketballGuide';

import { SuspenseWrapper } from '../components/SuspenseWrapper';

const Dashboard = React.lazy(() => import('../pages/app/Dashboard'));
const SquadBuilder = React.lazy(() => import('../pages/app/SquadBuilder'));
const Transfers = React.lazy(() => import('../pages/app/Transfers'));
const Fixtures = React.lazy(() => import('../pages/app/Fixtures'));
const Standings = React.lazy(() => import('../pages/app/Standings'));
const Profile = React.lazy(() => import('../pages/app/Profile'));
const Players = React.lazy(() => import('../pages/app/Players'));
const MatchCenter = React.lazy(() => import('../pages/app/MatchCenter'));
const Leagues = React.lazy(() => import('../pages/app/Leagues'));
const DraftLeagues = React.lazy(() => import('../pages/app/DraftLeagues'));
const DraftRoom = React.lazy(() => import('../pages/app/DraftRoom'));
const DraftDashboard = React.lazy(() => import('../pages/app/DraftDashboard'));
const LeagueView = React.lazy(() => import('../pages/public/LeagueView'));
import NotFound from '../pages/public/NotFound';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'user' | 'admin' }) => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    const sport = window.location.pathname.startsWith('/basketball') ? 'basketball' : 'football';
    return <Navigate to={`/${sport}/login`} replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    const sport = window.location.pathname.startsWith('/basketball') ? 'basketball' : 'football';
    return <Navigate to={`/${sport}/login`} replace />; // Or unauthorized page
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Portal />
  },
  {
    path: '/guide',
    element: <BasketballGuide />
  },
  {
    path: '/football',
    children: [
      {
        element: <PublicLayout sport="football" />,
        children: [
          { index: true, element: <FootballHome /> },
          { path: 'league', element: <SuspenseWrapper><LeagueView sport="football" /></SuspenseWrapper> },
          { path: 'leagues', element: <SuspenseWrapper><div className="p-8 w-full"><Leagues sport="football" /></div></SuspenseWrapper> },
          { path: 'players', element: <SuspenseWrapper><div className="p-8 w-full h-[600px]"><Players sport="football" /></div></SuspenseWrapper> },
          { path: 'match-center', element: <SuspenseWrapper><div className="p-8 w-full"><MatchCenter sport="football" /></div></SuspenseWrapper> },
          { path: 'fixtures', element: <SuspenseWrapper><div className="p-8 w-full"><Fixtures sport="football" /></div></SuspenseWrapper> },
          { path: 'standings', element: <SuspenseWrapper><div className="p-8 w-full"><Standings sport="football" /></div></SuspenseWrapper> },
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Login isRegister /> },
          { path: ':slug', element: <DynamicPage sport="football" /> },
          { path: '*', element: <NotFound /> }
        ]
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><AppLayout sport="football" /></ProtectedRoute>,
        children: [
          { index: true, element: <SuspenseWrapper><Dashboard sport="football" /></SuspenseWrapper> },
          { path: 'squad', element: <SuspenseWrapper><SquadBuilder sport="football" /></SuspenseWrapper> },
          { path: 'transfers', element: <SuspenseWrapper><Transfers sport="football" /></SuspenseWrapper> },
          { path: 'fixtures', element: <SuspenseWrapper><Fixtures sport="football" /></SuspenseWrapper> },
          { path: 'standings', element: <SuspenseWrapper><Standings sport="football" /></SuspenseWrapper> },
          { path: 'leagues', element: <SuspenseWrapper><Leagues sport="football" /></SuspenseWrapper> },
          { path: 'players', element: <SuspenseWrapper><Players sport="football" /></SuspenseWrapper> },
          { path: 'match-center', element: <SuspenseWrapper><MatchCenter sport="football" /></SuspenseWrapper> },
          { path: 'profile', element: <SuspenseWrapper><Profile sport="football" /></SuspenseWrapper> },
          { path: 'drafts', element: <SuspenseWrapper><DraftLeagues sport="football" /></SuspenseWrapper> },
          { path: 'draft/:id', element: <SuspenseWrapper><DraftRoom /></SuspenseWrapper> },
          { path: 'draft/:id/dashboard', element: <SuspenseWrapper><DraftDashboard sport="football" /></SuspenseWrapper> },
          { path: '*', element: <NotFound /> }
        ]
      }
    ]
  },
  {
    path: '/basketball',
    children: [
      {
        element: <PublicLayout sport="basketball" />,
        children: [
          { index: true, element: <BasketballHome /> },
          { path: 'league', element: <SuspenseWrapper><LeagueView sport="basketball" /></SuspenseWrapper> },
          { path: 'leagues', element: <SuspenseWrapper><div className="p-8 w-full"><Leagues sport="basketball" /></div></SuspenseWrapper> },
          { path: 'players', element: <SuspenseWrapper><div className="p-8 w-full h-[600px]"><Players sport="basketball" /></div></SuspenseWrapper> },
          { path: 'match-center', element: <SuspenseWrapper><div className="p-8 w-full"><MatchCenter sport="basketball" /></div></SuspenseWrapper> },
          { path: 'fixtures', element: <SuspenseWrapper><div className="p-8 w-full"><Fixtures sport="basketball" /></div></SuspenseWrapper> },
          { path: 'standings', element: <SuspenseWrapper><div className="p-8 w-full"><Standings sport="basketball" /></div></SuspenseWrapper> },
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Login isRegister /> },
          { path: 'guide', element: <BasketballGuide /> },
          { path: ':slug', element: <DynamicPage sport="basketball" /> },
          { path: '*', element: <NotFound /> }
        ]
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><AppLayout sport="basketball" /></ProtectedRoute>,
        children: [
          { index: true, element: <SuspenseWrapper><Dashboard sport="basketball" /></SuspenseWrapper> },
          { path: 'squad', element: <SuspenseWrapper><SquadBuilder sport="basketball" /></SuspenseWrapper> },
          { path: 'transfers', element: <SuspenseWrapper><Transfers sport="basketball" /></SuspenseWrapper> },
          { path: 'fixtures', element: <SuspenseWrapper><Fixtures sport="basketball" /></SuspenseWrapper> },
          { path: 'standings', element: <SuspenseWrapper><Standings sport="basketball" /></SuspenseWrapper> },
          { path: 'leagues', element: <SuspenseWrapper><Leagues sport="basketball" /></SuspenseWrapper> },
          { path: 'players', element: <SuspenseWrapper><Players sport="basketball" /></SuspenseWrapper> },
          { path: 'match-center', element: <SuspenseWrapper><MatchCenter sport="basketball" /></SuspenseWrapper> },
          { path: 'profile', element: <SuspenseWrapper><Profile sport="basketball" /></SuspenseWrapper> },
          { path: 'drafts', element: <SuspenseWrapper><DraftLeagues sport="basketball" /></SuspenseWrapper> },
          { path: 'draft/:id', element: <SuspenseWrapper><DraftRoom /></SuspenseWrapper> },
          { path: 'draft/:id/dashboard', element: <SuspenseWrapper><DraftDashboard sport="basketball" /></SuspenseWrapper> },
          { path: '*', element: <NotFound /> }
        ]
      }
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: ':sport/players', element: <AdminPlayers /> },
      { path: ':sport/fixtures', element: <AdminFixtures /> },
      { path: ':sport/stats', element: <AdminStats /> },
      { path: ':sport/users', element: <AdminUsers /> },
      { path: 'users', element: <AdminUsers sport="global" /> },
      { path: 'blocks', element: <AdminBlocks /> },
      { path: 'blogs', element: <AdminBlogs /> },
      { path: 'pages', element: <AdminPages /> },
      { path: 'menus', element: <AdminMenus /> },
      { path: 'drafts', element: <AdminDrafts /> },
      { path: 'minileagues', element: <AdminMiniLeagues /> },
      { path: 'ads', element: <AdminAds /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'features', element: <AdminFeatures /> },
      { path: '*', element: <div className="p-12 text-center text-text-muted">Section coming soon...</div> }
    ]
  }
]);
