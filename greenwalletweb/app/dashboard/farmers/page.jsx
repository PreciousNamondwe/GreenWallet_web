'use client';
import { useState } from 'react';
import { Users, Search, Filter, Plus, Download } from 'lucide-react';

export default function FarmersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const farmers = [
    { id: 1, name: 'Musa Abdullahi', phone: '+2348012345678', location: 'Kano', status: 'Active', loans: 2 },
    { id: 2, name: 'Amina Bello', phone: '+2348023456789', location: 'Lagos', status: 'Active', loans: 1 },
    { id: 3, name: 'Chukwu Emeka', phone: '+2348034567890', location: 'Enugu', status: 'Pending', loans: 0 },
    { id: 4, name: 'Fatima Yusuf', phone: '+2348045678901', location: 'Kaduna', status: 'Active', loans: 1 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Farmers Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage all registered farmers and their information.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm font-medium">
              <Plus className="h-4 w-4" />
              <span>Add Farmer</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder-muted-foreground text-sm"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">Farmer</th>
                <th className="text-left p-4 font-semibold text-foreground">Contact</th>
                <th className="text-left p-4 font-semibold text-foreground">Location</th>
                <th className="text-left p-4 font-semibold text-foreground">Status</th>
                <th className="text-left p-4 font-semibold text-foreground">Active Loans</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer) => (
                <tr key={farmer.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-foreground">{farmer.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{farmer.phone}</td>
                  <td className="p-4 text-muted-foreground">{farmer.location}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      farmer.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {farmer.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{farmer.loans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}