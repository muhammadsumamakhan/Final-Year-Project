import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin/UserLogin';
import UserRegister from './pages/UserLogin/UserRegister'
import ExpertLogin from './pages/ExpertLogin/ExpertLogin'
import ExpertRegister from './pages/ExpertLogin/ExpertRegister'
import About from './pages/About';
import Service from './pages/Service';
import Contact from './pages/Contact';
import UserPortal from './pages/UserPortal/UserPortal'
import UserService from './pages/UserPortal/UserService'
import Allexpert from './pages/ExpertPortal/Allexpert'
import SingleExpert from './pages/ExpertPortal/SingleExpert'
import ExpertPortal from './pages/ExpertPortal/ExpertPortal';
import ExpertTest from './pages/ExpertPortal/ExpertTest';
import ExpertOrder from './pages/ExpertPortal/ExpertOrder';
import AdminRegister from './pages/AdminPortal/AdminLogin/AdminRegister';
import AdminLogin from './pages/AdminPortal/AdminLogin/AdminLogin';
import AdminPortal from './pages/AdminPortal/AdminPortal';
import ManageUsers from './pages/AdminPortal/ManageUsers';
import ManageExperts from './pages/AdminPortal/ManageExperts';
import ManageExpertsRequest from './pages/AdminPortal/ManageExpertsRequest';
import UserProfile from './pages/UserPortal/UserProfile';
import ExpertProfile from './pages/ExpertPortal/ExpertProfile';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'service', element: <Service /> },
      { path: 'contact', element: <Contact /> },
      { path: 'userlogin', element: <UserLogin /> },
      { path: 'userregister', element: <UserRegister /> },
      { path: 'expertlogin', element: <ExpertLogin /> },
      { path: 'expertregister', element: <ExpertRegister /> },
      { path: 'userportal', element: <UserPortal /> },
      { path: 'userservice', element: <UserService /> },
      { path: 'allexpert', element: <Allexpert /> },
      { path: '/expert/:id', element: <SingleExpert />},
      { path: 'expertportal', element: <ExpertPortal /> },
      { path: 'experttest', element: <ExpertTest /> },
      { path: 'expertorder', element: <ExpertOrder /> },
      { path: 'adminlogin', element: <AdminLogin /> },
      { path: 'adminregister', element: <AdminRegister /> },
      { path: 'adminportal', element: <AdminPortal /> },
      { path: 'admin-manage-users', element: <ManageUsers /> },
      { path: 'admin-manage-experts', element: <ManageExperts /> },
      { path: 'admin-manage-experts-request', element: <ManageExpertsRequest /> },
      { path: 'user-profile', element: <UserProfile /> },
      { path: 'expert-profile', element: <ExpertProfile /> },
  
    ]
  }
]);

// Render the application
createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
