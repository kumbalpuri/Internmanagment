import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { StudentList } from './components/Students/StudentList';
import { StudentModal } from './components/Students/StudentModal';
import { JobList } from './components/Jobs/JobList';
import { CallManagement } from './components/Calls/CallManagement';
import { MeetingsList } from './components/Meetings/MeetingsList';
import { OfferManagement } from './components/Offers/OfferManagement';
import { VoiceSettings } from './components/Settings/VoiceSettings';
import { AutomatedWorkflow } from './components/Workflow/AutomatedWorkflow';
import { InputManagement } from './components/InputManagement/InputManagement';
import { JotFormIntegration } from './components/JotForm/JotFormIntegration';
import { Student, JobDescription } from './types';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    // For demo purposes, just show the view modal
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleViewJob = (job: JobDescription) => {
    console.log('View job:', job);
    // Implement job view modal
  };

  const handleEditJob = (job: JobDescription) => {
    console.log('Edit job:', job);
    // Implement job edit modal
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return (
          <>
            <StudentList 
              onViewStudent={handleViewStudent}
              onEditStudent={handleEditStudent}
            />
            <StudentModal
              student={selectedStudent}
              isOpen={isStudentModalOpen}
              onClose={() => setIsStudentModalOpen(false)}
            />
          </>
        );
      case 'jobs':
        return (
          <JobList 
            onViewJob={handleViewJob}
            onEditJob={handleEditJob}
          />
        );
      case 'calls':
        return <CallManagement />;
      case 'meetings':
        return <MeetingsList />;
      case 'offers':
        return <OfferManagement />;
      case 'workflow':
        return <AutomatedWorkflow />;
      case 'inputs':
        return <InputManagement />;
      case 'jotform':
        return <JotFormIntegration />;
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
            <p className="text-gray-600">Comprehensive reporting dashboard coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h2>
              <p className="text-gray-600">Configure voice settings and system preferences</p>
            </div>
            <VoiceSettings />
          </>
        );
      default:
        return <Dashboard />;
    }
  };

  const getSectionTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      students: 'Student Management',
      jobs: 'Job Descriptions',
      calls: 'Call Management',
      meetings: 'Meeting Scheduler',
      offers: 'Offer Management',
      workflow: 'Automated Workflow',
      inputs: 'Input Management',
      jotform: 'JotForm Integration',
      reports: 'Reports & Analytics',
      settings: 'Settings',
    };
    return titles[activeSection as keyof typeof titles] || 'Dashboard';
  };

  const getSectionSubtitle = () => {
    const subtitles = {
      dashboard: 'Overview of your intern management system',
      students: 'Manage student profiles and applications',
      jobs: 'Manage internship positions and requirements',
      calls: 'Schedule and track communications',
      meetings: 'Coordinate mentor meetings',
      offers: 'Create and track internship offers',
      workflow: 'Jerry-powered automated intern management',
      inputs: 'Add and manage system data',
      jotform: 'Student application data from JotForm',
      reports: 'Analyze performance and metrics',
      settings: 'Configure system preferences',
    };
    return subtitles[activeSection as keyof typeof subtitles];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getSectionTitle()}
          subtitle={getSectionSubtitle()}
        />
        
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;