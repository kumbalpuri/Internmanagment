import React from 'react';
import { 
  Users, 
  Briefcase, 
  Phone, 
  Calendar, 
  FileText, 
  Award,
  BarChart3,
  Settings,
  ChevronRight,
  Bot,
  Database,
  ExternalLink,
  Building,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: BarChart3,
    description: 'Overview & Analytics'
  },
  { 
    id: 'workflow', 
    label: 'Jerry AI Workflow', 
    icon: Bot,
    description: 'Automated Process',
    highlight: true
  },
  { 
    id: 'students', 
    label: 'Students', 
    icon: Users,
    description: 'Student Management'
  },
  { 
    id: 'jobs', 
    label: 'Job Positions', 
    icon: Briefcase,
    description: 'Internship Roles'
  },
  { 
    id: 'calls', 
    label: 'Voice Calls', 
    icon: Phone,
    description: 'AI-Powered Calls',
    highlight: true
  },
  { 
    id: 'meetings', 
    label: 'Meetings', 
    icon: Calendar,
    description: 'Interview Scheduling'
  },
  { 
    id: 'offers', 
    label: 'Offers', 
    icon: Award,
    description: 'Job Offers'
  },
  { 
    id: 'jotform', 
    label: 'Applications', 
    icon: ExternalLink,
    description: 'JotForm Integration'
  },
  { 
    id: 'inputs', 
    label: 'Data Management', 
    icon: Database,
    description: 'System Inputs'
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: FileText,
    description: 'Analytics & Reports'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings,
    description: 'Voice & AI Config'
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-full flex flex-col shadow-xl">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">InternMS</h1>
            <p className="text-sm text-gray-300">AI-Powered Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:transform hover:scale-102'
                  } ${item.highlight ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${item.highlight ? 'text-purple-300' : ''}`} />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                  {item.highlight && !isActive && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">System Administrator</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};