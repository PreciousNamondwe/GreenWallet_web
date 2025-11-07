'use client';
import { FileText, Search, Filter, Plus } from 'lucide-react';

export default function LoansPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Loans Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage loan applications, approvals, and disbursements.</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm font-medium">
            <Plus className="h-4 w-4" />
            <span>New Loan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">892</h3>
          <p className="text-sm font-medium text-foreground">Active Loans</p>
          <p className="text-xs text-muted-foreground">Currently running</p>
        </div>
        
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-green-600" />
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">₦24.5M</h3>
          <p className="text-sm font-medium text-foreground">Total Portfolio</p>
          <p className="text-xs text-muted-foreground">Active loan value</p>
        </div>
        
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-orange-600" />
            <span className="text-red-600 text-sm font-medium">-5%</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">34</h3>
          <p className="text-sm font-medium text-foreground">Pending</p>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </div>
        
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-purple-600" />
            <span className="text-green-600 text-sm font-medium">+2.1%</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">94.7%</h3>
          <p className="text-sm font-medium text-foreground">Repayment Rate</p>
          <p className="text-xs text-muted-foreground">On-time payments</p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search loans..."
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder-muted-foreground text-sm"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Loan Applications</h3>
          <p className="text-muted-foreground">Detailed loan management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}