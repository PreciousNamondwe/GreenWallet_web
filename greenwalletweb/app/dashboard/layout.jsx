'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  DollarSign, 
  FileText, 
  Building, 
  Search,
  Bell,
  Menu,
  X,
  Home,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const fetchUserData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserData({
        institutionName: "GreenField Microfinance",
        contactPerson: "Precious Namondwe",
        email: "admin@greenfield.mf",
        totalFarmers: 1247,
        activeLoans: 892,
        totalPortfolio: 24500000,
        pendingApplications: 34,
        portfolioGrowth: 15.2,
        repaymentRate: 94.7
      });
    };
    
    fetchUserData();
  }, []);

 // Update active page based on current path
useEffect(() => {
  const pathSegments = pathname.split('/');
  const currentPage = pathSegments[pathSegments.length - 1] || 'dashboard';
  setActivePage(currentPage);
}, [pathname]);

 const navigation = [
  { name: 'Dashboard', href: '/dashboard/dashboard', icon: Home, current: activePage === 'dashboard' },
  { name: 'Farmers', href: '/dashboard/farmers', icon: Users, current: activePage === 'farmers' },
  { name: 'Loans', href: '/dashboard/loans', icon: FileText, current: activePage === 'loans' },
  { name: 'Payments', href: '/dashboard/payments', icon: DollarSign, current: activePage === 'payments' },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, current: activePage === 'reports' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, current: activePage === 'settings' },
];

  const handleNavigation = (href) => {
    router.push(href);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border 
        transform transition-transform duration-300 ease-in-out 
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
        flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="flex-shrink-0 p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">AgriFin Pro</h1>
              <p className="text-xs text-muted-foreground truncate">Microfinance Portal</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-muted rounded transition-colors ml-auto"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 w-full text-left ${
                item.current
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="flex-shrink-0 p-4 border-t border-border">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-medium">PN</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userData.contactPerson}</p>
              <p className="text-xs text-muted-foreground truncate">{userData.institutionName}</p>
            </div>
            <LogOut className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-background border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{userData.contactPerson}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-xs font-semibold">JM</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Dynamic based on active page */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}