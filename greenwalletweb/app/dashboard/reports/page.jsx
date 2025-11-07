'use client';
import { useState } from 'react';
import { BarChart3, Download, Filter, Calendar, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('month');

  const reportTypes = [
    { id: 'financial', name: 'Financial Summary', icon: DollarSign, color: 'text-green-600' },
    { id: 'loans', name: 'Loan Portfolio', icon: FileText, color: 'text-blue-600' },
    { id: 'farmers', name: 'Farmer Analytics', icon: Users, color: 'text-purple-600' },
    { id: 'performance', name: 'Performance', icon: TrendingUp, color: 'text-orange-600' },
  ];

  const quickReports = [
    { title: 'Monthly Collection', description: 'January 2024 collection report', downloads: 45 },
    { title: 'Loan Disbursement', description: 'Q4 2023 disbursement analysis', downloads: 32 },
    { title: 'Farmer Growth', description: 'Annual farmer registration trend', downloads: 28 },
    { title: 'Portfolio Health', description: 'Current portfolio risk assessment', downloads: 51 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Generate insights and track performance metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              <Download className="h-4 w-4" />
              <span>Export All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              reportType === type.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <type.icon className={`h-8 w-8 mb-3 ${type.color}`} />
            <h3 className="font-semibold text-foreground mb-1">{type.name}</h3>
            <p className="text-xs text-muted-foreground">Generate detailed report</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-background border border-border rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Report Configuration</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Date Range
                  </label>
                  <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Filter className="h-4 w-4 inline mr-2" />
                    Report Format
                  </label>
                  <select className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm">
                    <option value="pdf">PDF Document</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV File</option>
                    <option value="html">Web Page</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-2">Include Sections</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Summary', 'Charts', 'Tables', 'Recommendations', 'Raw Data', 'Executive Summary'].map((section) => (
                    <label key={section} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground">{section}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium">
                  <BarChart3 className="h-4 w-4" />
                  <span>Generate {reportTypes.find(t => t.id === reportType)?.name} Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sample Chart Placeholder */}
          <div className="bg-background border border-border rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Report Preview</h2>
            </div>
            <div className="p-6">
              <div className="bg-muted rounded-lg p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Report Visualization</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a report to view detailed charts and analytics for {reportTypes.find(t => t.id === reportType)?.name.toLowerCase()}.
                </p>
                <div className="h-48 bg-background border border-border rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Chart will appear here</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reports & Stats */}
        <div className="space-y-6">
          {/* Quick Reports */}
          <div className="bg-background border border-border rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Quick Reports</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {quickReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{report.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{report.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                      <span className="text-xs text-muted-foreground">{report.downloads} downloads</span>
                      <button className="p-1 hover:bg-background rounded transition-colors">
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Stats */}
          <div className="bg-background border border-border rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Report Statistics</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {[
                { label: 'Reports Generated', value: '1,247', change: '+12%' },
                { label: 'Average Downloads', value: '38', change: '+5%' },
                { label: 'Most Popular', value: 'Financial', change: '' },
                { label: 'Automated Reports', value: '24', change: '+3' },
              ].map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                    {stat.change && (
                      <span className="text-xs text-green-600 ml-2">{stat.change}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}