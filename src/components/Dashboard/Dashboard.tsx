import React from 'react';
import { StatsCard } from './StatsCard';
import { Users, Briefcase, Phone, Award, Calendar, TrendingUp } from 'lucide-react';
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
    { id: 1, activity: 'New student profile added: Aarav Sharma', time: '2 hours ago', type: 'student' },
    { id: 2, activity: 'Call completed with TPO Dr. Rajesh Kumar', time: '4 hours ago', type: 'call' },
    { id: 3, activity: 'Offer accepted by Rahul Gupta', time: '1 day ago', type: 'offer' },
    { id: 4, activity: 'Meeting scheduled with Priya Patel', time: '1 day ago', type: 'meeting' },
    { id: 5, activity: 'New job description posted: Mobile App Developer', time: '2 days ago', type: 'job' },
  ];

  return (
    <div className="p-6 space-y-6">
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
          title="Completed Calls"
          value={completedCalls}
          icon={Phone}
          trend={{ value: '15%', isPositive: true }}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-medium text-gray-900">{activeStudents}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(activeStudents / mockStudents.length) * 100}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Shortlisted</span>
              <span className="text-sm font-medium text-gray-900">{shortlistedStudents}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(shortlistedStudents / mockStudents.length) * 100}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Selected</span>
              <span className="text-sm font-medium text-gray-900">{selectedStudents}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(selectedStudents / mockStudents.length) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'student' ? 'bg-blue-500' :
                  activity.type === 'call' ? 'bg-purple-500' :
                  activity.type === 'offer' ? 'bg-green-500' :
                  activity.type === 'meeting' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.activity}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};