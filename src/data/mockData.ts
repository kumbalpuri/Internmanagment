import { Student, JobDescription, TPO, CallLog, Meeting, Offer } from '../types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@email.com',
    phone: '+91-9876543210',
    college: 'IIT Delhi',
    course: 'Computer Science Engineering',
    year: 3,
    cgpa: 8.7,
    skills: ['React', 'Node.js', 'Python', 'Machine Learning'],
    experience: 'Built 3 full-stack web applications, contributed to open source projects',
    resume: 'aarav_sharma_resume.pdf',
    status: 'active',
    appliedPositions: ['1', '2'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+91-9876543211',
    college: 'BITS Pilani',
    course: 'Information Technology',
    year: 2,
    cgpa: 9.1,
    skills: ['Java', 'Spring Boot', 'Angular', 'Database Design'],
    experience: 'Internship at local startup, developed REST APIs',
    resume: 'priya_patel_resume.pdf',
    status: 'shortlisted',
    appliedPositions: ['1', '3'],
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-22T11:45:00Z'
  },
  {
    id: '3',
    name: 'Rahul Gupta',
    email: 'rahul.gupta@email.com',
    phone: '+91-9876543212',
    college: 'NIT Trichy',
    course: 'Electronics Engineering',
    year: 4,
    cgpa: 8.3,
    skills: ['IoT', 'Arduino', 'Python', 'Data Analysis'],
    experience: 'Research project on smart home systems',
    resume: 'rahul_gupta_resume.pdf',
    status: 'selected',
    appliedPositions: ['2'],
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-25T16:20:00Z'
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    phone: '+91-9876543213',
    college: 'IIIT Hyderabad',
    course: 'Computer Science',
    year: 3,
    cgpa: 8.9,
    skills: ['React Native', 'Flutter', 'Firebase', 'UI/UX Design'],
    experience: 'Published 2 mobile apps on Play Store',
    resume: 'sneha_reddy_resume.pdf',
    status: 'active',
    appliedPositions: ['3'],
    createdAt: '2024-01-18T11:30:00Z',
    updatedAt: '2024-01-23T13:15:00Z'
  }
];

export const mockJobDescriptions: JobDescription[] = [
  {
    id: '1',
    title: 'Full Stack Developer Intern',
    company: 'TechCorp Solutions',
    description: 'Work on cutting-edge web applications using modern technologies. Collaborate with senior developers and gain hands-on experience in full-stack development.',
    requirements: ['Bachelor\'s in Computer Science or related field', 'Strong programming fundamentals', 'Knowledge of web technologies', 'Good communication skills'],
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'HTML/CSS'],
    duration: '6 months',
    stipend: 25000,
    location: 'Bangalore',
    type: 'hybrid',
    status: 'active',
    tpoId: '1',
    applicants: 45,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'Data Science Intern',
    company: 'DataInsights Ltd',
    description: 'Analyze large datasets and build predictive models. Work with machine learning algorithms and data visualization tools.',
    requirements: ['Knowledge of statistics and mathematics', 'Programming experience in Python or R', 'Understanding of ML concepts', 'Analytical mindset'],
    skills: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn'],
    duration: '4 months',
    stipend: 30000,
    location: 'Mumbai',
    type: 'remote',
    status: 'active',
    tpoId: '2',
    applicants: 32,
    createdAt: '2024-01-12T09:30:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: '3',
    title: 'Mobile App Developer Intern',
    company: 'MobileFirst Inc',
    description: 'Develop native and cross-platform mobile applications. Learn about mobile UI/UX design and app deployment processes.',
    requirements: ['Basic knowledge of mobile development', 'Understanding of app lifecycle', 'Creative problem-solving skills', 'Eagerness to learn'],
    skills: ['React Native', 'Flutter', 'iOS/Android', 'Firebase', 'API Integration'],
    duration: '5 months',
    stipend: 28000,
    location: 'Pune',
    type: 'onsite',
    status: 'active',
    tpoId: '1',
    applicants: 28,
    createdAt: '2024-01-14T12:00:00Z',
    updatedDate: '2024-01-22T16:45:00Z'
  }
];

export const mockTPOs: TPO[] = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@iitdelhi.ac.in',
    phone: '+91-9876543220',
    college: 'IIT Delhi',
    designation: 'Training & Placement Officer',
    jobDescriptions: ['1', '3'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Prof. Sunita Agarwal',
    email: 'sunita.agarwal@bitspilani.ac.in',
    phone: '+91-9876543221',
    college: 'BITS Pilani',
    designation: 'Career Services Head',
    jobDescriptions: ['2'],
    createdAt: '2024-01-02T00:00:00Z'
  }
];

export const mockCallLogs: CallLog[] = [
  {
    id: '1',
    studentId: '1',
    type: 'student',
    duration: 15,
    status: 'completed',
    notes: 'Discussed internship requirements and shared JotForm for application',
    jotFormSent: true,
    completedAt: '2024-01-20T10:30:00Z',
    createdAt: '2024-01-20T10:15:00Z'
  },
  {
    id: '2',
    tpoId: '1',
    type: 'tpo',
    duration: 25,
    status: 'completed',
    notes: 'Reviewed new job requirements and timeline for student selection',
    jotFormSent: false,
    completedAt: '2024-01-21T14:20:00Z',
    createdAt: '2024-01-21T14:00:00Z'
  },
  {
    id: '3',
    studentId: '2',
    type: 'student',
    duration: 0,
    status: 'scheduled',
    notes: 'Follow-up call for application status',
    jotFormSent: false,
    scheduledAt: '2024-01-26T15:00:00Z',
    createdAt: '2024-01-25T09:00:00Z'
  }
];

export const mockMeetings: Meeting[] = [
  {
    id: '1',
    studentId: '2',
    mentorName: 'Arjun Mehta',
    mentorEmail: 'arjun.mehta@techcorp.com',
    scheduledAt: '2024-01-28T10:00:00Z',
    duration: 60,
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
    status: 'scheduled',
    notes: 'Technical interview and project discussion',
    createdAt: '2024-01-24T12:00:00Z'
  },
  {
    id: '2',
    studentId: '3',
    mentorName: 'Kavya Singh',
    mentorEmail: 'kavya.singh@datainsights.com',
    scheduledAt: '2024-01-25T14:30:00Z',
    duration: 45,
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
    status: 'completed',
    notes: 'Successful interview, moving to offer stage',
    createdAt: '2024-01-23T16:30:00Z'
  }
];

export const mockOffers: Offer[] = [
  {
    id: '1',
    studentId: '3',
    jobId: '2',
    status: 'accepted',
    stipend: 30000,
    startDate: '2024-02-15',
    duration: '4 months',
    termsAndConditions: 'Standard internship terms and conditions apply',
    sentAt: '2024-01-26T09:00:00Z',
    respondedAt: '2024-01-26T15:30:00Z',
    createdAt: '2024-01-26T09:00:00Z'
  },
  {
    id: '2',
    studentId: '2',
    jobId: '1',
    status: 'pending',
    stipend: 25000,
    startDate: '2024-03-01',
    duration: '6 months',
    termsAndConditions: 'Standard internship terms and conditions apply',
    sentAt: '2024-01-27T11:00:00Z',
    createdAt: '2024-01-27T11:00:00Z'
  }
];