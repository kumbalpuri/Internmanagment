import React, { useState } from 'react';
import { Student } from '../../types';
import { mockStudents } from '../../data/mockData';
import { Eye, Phone, Mail, Edit, MoreHorizontal, Download } from 'lucide-react';

interface StudentListProps {
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({ onViewStudent, onEditStudent }) => {
  const [students] = useState<Student[]>(mockStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');

  React.useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    if (collegeFilter !== 'all') {
      filtered = filtered.filter(student => student.college === collegeFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter, collegeFilter]);

  const colleges = Array.from(new Set(students.map(s => s.college)));

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-yellow-100 text-yellow-800',
      selected: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search students by name, email, college, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Colleges</option>
              {colleges.map(college => (
                <option key={college} value={college}>{college}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="text-left py-3 px-6 font-medium text-gray-500 uppercase tracking-wider">College</th>
              <th className="text-left py-3 px-6 font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="text-left py-3 px-6 font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
              <th className="text-left py-3 px-6 font-medium text-gray-500 uppercase tracking-wider">Skills</th>
              <th className="text-left py-3 px-6 font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-6 font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-900">{student.college}</td>
                <td className="py-4 px-6 text-sm text-gray-900">
                  <div>{student.course}</div>
                  <div className="text-xs text-gray-500">Year {student.year}</div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-900 font-medium">{student.cgpa}</td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {student.skills.length > 3 && (
                      <span className="text-xs text-gray-500">+{student.skills.length - 3} more</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                    {student.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewStudent(student)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Call Student"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditStudent(student)}
                      className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="Edit Student"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Download Resume"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No students found matching your criteria.</div>
        </div>
      )}
    </div>
  );
};