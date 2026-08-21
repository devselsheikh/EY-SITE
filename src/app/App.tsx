import React from 'react';
import { MotionConfig } from 'motion/react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import Landing from './pages/Landing';
import DaycareHome from './pages/daycare/Home';
import DaycareAbout from './pages/daycare/About';
import DaycarePrograms from './pages/daycare/Programs';
import DaycareParentInfo from './pages/daycare/ParentInfo';
import DaycareContact from './pages/daycare/Contact';
import DaycareCalendar from './pages/daycare/Calendar';
import EduHubHome from './pages/eduhub/Home';
import EduHubPrograms from './pages/eduhub/Programs';
import EduHubProgramDetail from './pages/eduhub/ProgramDetail';
import EduHubAbout from './pages/eduhub/About';
import EduHubContact from './pages/eduhub/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ContactSplit from './pages/ContactSplit';
import Admin from './pages/Admin';
import ParentPortal from './pages/daycare/ParentPortal';
import ScrollToTop from './components/ScrollToTop';
import BackToTopButton from './components/BackToTopButton';
import StickyMobileCTA from './components/StickyMobileCTA';
import PageTransition from './components/PageTransition';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <BackToTopButton />
      <StickyMobileCTA />
      <PageTransition>{children}</PageTransition>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout><Landing /></AppLayout>,
  },
  {
    path: '/daycare',
    element: <AppLayout><DaycareHome /></AppLayout>,
  },
  {
    path: '/daycare/about',
    element: <AppLayout><DaycareAbout /></AppLayout>,
  },
  {
    path: '/daycare/programs',
    element: <AppLayout><DaycarePrograms /></AppLayout>,
  },
  {
    path: '/daycare/parent-info',
    element: <AppLayout><DaycareParentInfo /></AppLayout>,
  },
  {
    path: '/daycare/calendar',
    element: <AppLayout><DaycareCalendar /></AppLayout>,
  },
  {
    path: '/daycare/contact',
    element: <AppLayout><DaycareContact /></AppLayout>,
  },
  {
    path: '/daycare/parents',
    element: <AppLayout><ParentPortal /></AppLayout>,
  },
  {
    path: '/eduhub',
    element: <AppLayout><EduHubHome /></AppLayout>,
  },
  {
    path: '/eduhub/programs',
    element: <AppLayout><EduHubPrograms /></AppLayout>,
  },
  {
    path: '/eduhub/programs/:id',
    element: <AppLayout><EduHubProgramDetail /></AppLayout>,
  },
  {
    path: '/eduhub/about',
    element: <AppLayout><EduHubAbout /></AppLayout>,
  },
  {
    path: '/eduhub/contact',
    element: <AppLayout><EduHubContact /></AppLayout>,
  },
  {
    path: '/blog',
    element: <AppLayout><Blog /></AppLayout>,
  },
  {
    path: '/blog/:slug',
    element: <AppLayout><BlogPost /></AppLayout>,
  },
  {
    path: '/contact',
    element: <AppLayout><ContactSplit /></AppLayout>,
  },
  {
    path: '/admin',
    element: <Admin />,
  },
]);

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}