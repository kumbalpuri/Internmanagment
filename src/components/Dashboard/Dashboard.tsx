import React from 'react';
import { StatsCard } from './StatsCard';
import { Users, Briefcase, Phone, Award, Calendar, TrendingUp, Bot, Brain } from 'lucide-react';
import { mockStudents, mockJobDescriptions, mockCallLogs, mockOffers, mockMeetings } from '../../data/mockData';

export const Dashboard: React.FC = () => {
  const activeStudents = mockStudents.filter(s => s.status === 'active').length;
  const shortlistedStudents = mockStudents.filter(s => s.status === 'shortlisted').length;
  const selectedStudents = mockStudents.filter(s => s.status === 'selected').length;
  const activeJobs = mockJobDescriptions.filter(j => j.status === 'active').length;
  const completedCalls = mockCallLogs.filter(c => c.status === 'completed').length;
  const pendingOffers = mockOffers.filter(o => o.status === 'pending').length;
  const scheduledMeetings = mockMeetings.filter(m => m.status === 'scheduled').length;

  const recentActivities = [
    { id: 1, activity: 'Jerry completed automated screening for 15 applications', time: '30 minutes ago', type: 'ai', icon: Bot },
    { id: 2, activity: 'Voice call completed with TPO Dr. Rajesh Kumar', time: '1 hour ago', type: 'call', icon: Phone },
    { id: 3, activity: 'New student profile added: Aarav Sharma', time: '2 hours ago', type: 'student', icon: Users },
    { id: 4, activity: 'Jerry scheduled 3 interviews automatically', time: '3 hours ago', type: 'ai', icon: Bot },
    { id: 5, activity: 'Offer accepted by Rahul Gupta', time: '4 hours ago', type: 'offer', icon: Award },
    { id: 6, activity: 'Meeting scheduled with Priya Patel', time: '5 hours ago', type: 'meeting', icon: Calendar },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to InternMS</h1>
            <p className="text-blue-100">AI-powered intern management system with Jerry automation</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 rounded-lg p-3">
              <Brain className="w-8 h-8" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Powered by</div>
              <div className="font-bold">Gemini 2.0 Flash</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={mockStudents.length}
          icon={Users}
          trend={{ value: '12%', isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Active Jobs"
          value={activeJobs}
          icon={Briefcase}
          trend={{ value: '8%', isPositive: true }}
          color="green"
        />
        <StatsCard
          title="AI Voice Calls"
          value={completedCalls}
          icon={Phone}
          trend={{ value: '25%', isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Pending Offers"
          value={pendingOffers}
          icon={Award}
          trend={{ value: '3%', isPositive: false }}
          color="yellow"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Shortlisted Students"
          value={shortlistedStudents}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Selected Students"
          value={selectedStudents}
          icon={Award}
          color="blue"
        />
        <StatsCard
          title="Scheduled Meetings"
          value={scheduledMeetings}
          icon={Calendar}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Applications</span>
              <span className="text-sm font-medium text-gray-900">{activeStudents}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${(activeStudents / mockStudents.length) * 100}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Shortlisted</span>
              <span className="text-sm font-medium text-gray-900">{shortlistedStudents}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-yellow-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(shortlistedStudents / mockStudents.length) * 100}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Selected</span>
              <span className="text-sm font-medium text-gray-900">{selectedStudents}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(selectedStudents / mockStudents.length) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'ai' ? 'bg-purple-100' :
                    activity.type === 'student' ? 'bg-blue-100' :
                    activity.type === 'call' ? 'bg-green-100' :
                    activity.type === 'offer' ? 'bg-yellow-100' :
                    activity.type === 'meeting' ? 'bg-indigo-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      activity.type === 'ai' ? 'text-purple-600' :
                      activity.type === 'student' ? 'text-blue-600' :
                      activity.type === 'call' ? 'text-green-600' :
                      activity.type === 'offer' ? 'text-yellow-600' :
                      activity.type === 'meeting' ? 'text-indigo-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{activity.activity}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Features Highlight */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <Bot className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Jerry Automation</h4>
            <p className="text-sm text-gray-600">End-to-end workflow automation from TPO contact to offer distribution</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <Phone className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Voice Calls</h4>
            <p className="text-sm text-gray-600">AI-powered voice interactions with natural language processing</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <Brain className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Smart Screening</h4>
            <p className="text-sm text-gray-600">Intelligent resume evaluation and candidate shortlisting</p>
          </div>
        </div>
      </div>
    </div>
  );
};