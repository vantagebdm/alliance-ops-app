import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useRoutes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';
import Quotes from './pages/Quotes';
import SalesOrders from './pages/SalesOrders';
import Parts from './pages/Parts';
import Inventory from './pages/Inventory';
import Purchasing from './pages/Purchasing';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import DispatchPage from './pages/DispatchPage';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import GmailTest from './pages/GmailTest';
import Cashflow from './pages/Cashflow';
import CreditAppTemplates from './pages/CreditAppTemplates';
import Notifications from './pages/Notifications';
import ReceiveStock from './pages/ReceiveStock';
import SmartReorder from './pages/SmartReorder';
import Accounting from './pages/Accounting';
import UserManagement from './pages/UserManagement';
import Security from './pages/Security';
import DataManagement from './pages/DataManagement';
import SystemSettings from './pages/SystemSettings';
import DocumentNumbering from './pages/DocumentNumbering';
import PartNumbering from './pages/PartNumbering';
import PlatformDevelopment from './pages/PlatformDevelopment';
import { PermissionProvider } from '@/lib/PermissionContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import STSOrderForm from './pages/STSOrderForm';
import PartsQuoteRequest from './pages/PartsQuoteRequest';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/enquiries" element={<Enquiries />} />
        <Route path="/enquiries/:id" element={<Enquiries />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/quotes/:id" element={<Quotes />} />
        <Route path="/orders" element={<SalesOrders />} />
        <Route path="/orders/:id" element={<SalesOrders />} />
        <Route path="/parts" element={<Parts />} />
        <Route path="/parts/:id" element={<Parts />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/purchasing" element={<Purchasing />} />
        <Route path="/purchasing/:id" element={<Purchasing />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:id" element={<Invoices />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/cashflow" element={<Cashflow />} />
        <Route path="/gmail-test" element={<GmailTest />} />
        <Route path="/credit-application" element={<CreditAppTemplates />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/receive-stock" element={<ReceiveStock />} />
        <Route path="/smart-reorder" element={<SmartReorder />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/security" element={<Security />} />
        <Route path="/admin/data-management" element={<DataManagement />} />
        <Route path="/admin/system-settings" element={<SystemSettings />} />
        <Route path="/admin/document-numbering" element={<DocumentNumbering />} />
        <Route path="/admin/part-numbering" element={<PartNumbering />} />
        <Route path="/platform-development" element={<PlatformDevelopment />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <PermissionProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <Routes>
                <Route path="/workshop-parts-order" element={<STSOrderForm />} />
                <Route path="/parts-quote-request" element={<PartsQuoteRequest />} />
                <Route path="*" element={<AuthenticatedApp />} />
              </Routes>
            </Router>
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </PermissionProvider>
    </AuthProvider>
  )
}

export default App