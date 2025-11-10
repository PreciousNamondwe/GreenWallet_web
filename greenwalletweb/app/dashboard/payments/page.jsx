'use client';
import { useState } from 'react';
import { DollarSign, Search, Filter, Plus, Download, Calendar } from 'lucide-react';

export default function PaymentsPage() {
  const [timeRange, setTimeRange] = useState('month');
  
  const payments = [
    { id: 1, farmer: 'Musa Abdullahi', type: 'Repayment', amount: 'MKW45,000', date: '2024-01-15', status: 'Completed', method: 'Bank Transfer' },
    { id: 2, farmer: 'Amina Bello', type: 'Repayment', amount: 'MKW25,000', date: '2024-01-14', status: 'Completed', method: 'Mobile Money' },
    { id: 3, farmer: 'Chukwu Emeka', type: 'Disbursement', amount: 'MKW150,000', date: '2024-01-13', status: 'Completed', method: 'Bank Transfer' },
    { id: 4, farmer: 'Fatima Yusuf', type: 'Repayment', amount: 'MKW30,000', date: '2024-01-12', status: 'Pending', method: 'Cash' },
    { id: 5, farmer: 'Ibrahim Tanko', type: 'Repayment', amount: 'MKW20,000', date: '2024-01-11', status: 'Failed', method: 'Mobile Money' },
  ];

  const paymentStats = [
    { title: 'Total Collected', value: 'MKW2.4M', change: '+15%', trend: 'up', description: 'This month' },
    { title: 'Pending Payments', value: 'MKW125K', change: '-5%', trend: 'down', description: 'Awaiting clearance' },
    { title: 'Success Rate', value: '96.2%', change: '+1.2%', trend: 'up', description: 'Payment success' },
    { title: 'Average Payment', value: 'MKW28,500', change: '+8%', trend: 'up', description: 'Per transaction' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Payments Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Track and manage all financial transactions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm font-medium">
              <Plus className="h-4 w-4" />
              <span>Record Payment</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {paymentStats.map((stat, index) => (
          <div key={index} className="bg-background border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className={`h-6 w-6 ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className={`text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-foreground mb-1">{stat.title}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Time Range Filter */}
      <div className="bg-background border border-border rounded-xl shadow-sm mb-6">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Time Range:</span>
              </div>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  className="pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder-muted-foreground text-sm w-64"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">Farmer</th>
                <th className="text-left p-4 font-semibold text-foreground">Type</th>
                <th className="text-left p-4 font-semibold text-foreground">Amount</th>
                <th className="text-left p-4 font-semibold text-foreground">Date</th>
                <th className="text-left p-4 font-semibold text-foreground">Status</th>
                <th className="text-left p-4 font-semibold text-foreground">Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-foreground">{payment.farmer}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.type === 'Repayment' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {payment.type}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-foreground">{payment.amount}</td>
                  <td className="p-4 text-muted-foreground">{payment.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'Completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : payment.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{payment.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Top Payment Method</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">Bank Transfer</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">45% of total transactions</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Collection Efficiency</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">94.7%</p>
          <p className="text-sm text-green-700 dark:text-green-300">On-time repayment rate</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Average Processing</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">2.3 hrs</p>
          <p className="text-sm text-purple-700 dark:text-purple-300">Payment processing time</p>
        </div>
      </div>
    </div>
  );
}