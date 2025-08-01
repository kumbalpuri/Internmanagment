import React from 'react';
import { Bell, Search, Plus, Brain, Zap } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  onAddNew, 
  addNewLabel = 'Add New' 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>{title}</span>
              {title.includes('Jerry') && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 rounded-full">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">AI</span>
                </div>
              )}
              {title.includes('Voice') && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 rounded-full">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Powered</span>
                </div>
              )}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mt-1 flex items-center space-x-2">
                <span>{subtitle}</span>
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </span>
          </button>
          
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{addNewLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};