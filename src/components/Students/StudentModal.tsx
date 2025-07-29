import React from 'react';
import { Student } from '../../types';
import { X, Mail, Phone, Download, MapPin, Calendar, Award } from 'lucide-react';

interface StudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onShortlist?: (studentId: string) => void;
  onSelect?: (studentId: string) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ 
  student, 
  isOpen, 
  onClose, 
  onShortlist, 
  onSelect 
}) => {
  if (!isOpen || !student) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-gray-600">{student.course}, Year {student.year}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{student.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{student.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">College</p>
                  <p className="text-gray-900">{student.college}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">CGPA</p>
                  <p className="text-gray-900 font-semibold">{student.cgpa}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(student.status)}`}>
                  {student.status}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-gray-900">{new Date(student.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Resume</p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    {student.resume}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
            <p className="text-gray-700 leading-relaxed">{student.experience}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Applied Positions</h3>
            <div className="space-y-2">
              {student.appliedPositions.map((positionId, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">Position ID: {positionId}</span>
                  <span className="text-sm text-gray-500">Applied</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          
          {student.status === 'active' && onShortlist && (
            <button
              onClick={() => onShortlist(student.id)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Shortlist
            </button>
          )}
          
          {student.status === 'shortlisted' && onSelect && (
            <button
              onClick={() => onSelect(student.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Select
            </button>
          )}
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Schedule Call
          </button>
        </div>
      </div>
    </div>
  );
};