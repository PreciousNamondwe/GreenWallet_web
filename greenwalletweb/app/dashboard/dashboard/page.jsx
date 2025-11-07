'use client';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Plus,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';

export default function DashboardHomePage() {
  const userData = {
    institutionName: "GreenField Microfinance",
    contactPerson: "John Manager",
    email: "admin@greenfield.mf",
    totalFarmers: 1247,
    activeLoans: 892,
    totalPortfolio: 24500000,
    pendingApplications: 34,
    portfolioGrowth: 15.2,
    repaymentRate: 94.7
  };

  const stats = [
    {
      title: 'Total Farmers',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Registered farmers'
    },
    {
      title: 'Active Loans',
      value: '892',
      change: '+8%',
      trend: 'up',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Currently active'
    },
    {
      title: 'Total Portfolio',
      value: '₦24.5M',
      change: '+15.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Portfolio value'
    },
    {
      title: 'Repayment Rate',
      value: '94.7%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      description: 'On-time repayments'
    }
  ];

  const recentActivities = [
    { 
      id: 1, 
      farmer: 'Musa Abdullahi', 
      action: 'Loan Approved', 
      amount: '₦150,000', 
      time: '2 hours ago', 
      type: 'success',
      avatar: 'MA'
    },
    { 
      id: 2, 
      farmer: 'Amina Bello', 
      action: 'Application Submitted', 
      amount: '₦200,000', 
      time: '4 hours ago', 
      type: 'info',
      avatar: 'AB'
    },
    { 
      id: 3, 
      farmer: 'Chukwu Emeka', 
      action: 'Repayment Received', 
      amount: '₦45,000', 
      time: '6 hours ago', 
      type: 'success',
      avatar: 'CE'
    },
    { 
      id: 4, 
      farmer: 'Fatima Yusuf', 
      action: 'Loan Disbursed', 
      amount: '₦180,000', 
      time: '1 day ago', 
      type: 'success',
      avatar: 'FY'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm font-medium">
              <Plus className="h-4 w-4" />
              <span>New Loan</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-background border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-foreground mb-1">{stat.title}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Three Containers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-background border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="text-primary hover:text-primary/80 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <div className="p-2">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                      activity.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      {activity.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{activity.farmer}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-foreground text-sm">{activity.amount}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border border-border rounded-xl shadow-sm h-fit">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: Users, label: 'Add Farmer', desc: 'Register new' },
                  { icon: FileText, label: 'New Loan', desc: 'Create application' },
                  { icon: DollarSign, label: 'Process Payment', desc: 'Record repayment' },
                  { icon: BarChart3, label: 'Generate Report', desc: 'View analytics' }
                ].map((action, index) => (
                  <button 
                    key={index}
                    className="p-3 sm:p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-center group h-24"
                  >
                    <action.icon className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="font-medium text-foreground text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl shadow-sm h-fit">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Performance</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {[
                  { label: 'Portfolio Growth', value: '+15.2%', color: 'text-green-600 dark:text-green-400' },
                  { label: 'Repayment Rate', value: '94.7%', color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Default Rate', value: '2.1%', color: 'text-red-600 dark:text-red-400' },
                  { label: 'Customer Satisfaction', value: '96.3%', color: 'text-blue-600 dark:text-blue-400' }
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <span className={`text-sm font-semibold ${metric.color}`}>{metric.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <div className="bg-gradient-to-r from-primary to-green-500 text-primary-foreground p-4 rounded-lg text-center">
                  <p className="text-sm font-medium">Excellent Performance</p>
                  <p className="text-xs opacity-90 mt-1">Keep up the great work!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}