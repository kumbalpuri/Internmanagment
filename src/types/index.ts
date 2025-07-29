export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  year: number;
  cgpa: number;
  skills: string[];
  experience: string;
  resume: string;
  status: 'active' | 'shortlisted' | 'selected' | 'rejected';
  appliedPositions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  duration: string;
  stipend: number;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  status: 'active' | 'draft' | 'closed';
  tpoId: string;
  applicants: number;
  createdAt: string;
  updatedAt: string;
}

export interface TPO {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  designation: string;
  jobDescriptions: string[];
  createdAt: string;
}

export interface CallLog {
  id: string;
  studentId?: string;
  tpoId?: string;
  type: 'student' | 'tpo';
  duration: number;
  status: 'completed' | 'missed' | 'scheduled';
  notes: string;
  jotFormSent: boolean;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  studentId: string;
  mentorName: string;
  mentorEmail: string;
  scheduledAt: string;
  duration: number;
  meetingLink: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  studentId: string;
  jobId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  stipend: number;
  startDate: string;
  duration: string;
  termsAndConditions: string;
  sentAt: string;
  respondedAt?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tpo';
  permissions: string[];
}