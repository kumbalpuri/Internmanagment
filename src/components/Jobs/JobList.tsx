import React, { useState } from 'react';
import { JobDescription } from '../../types';
import { mockJobDescriptions } from '../../data/mockData';
import { Eye, Edit, MapPin, Calendar, DollarSign, Users } from 'lucide-react';

interface JobListProps {
  onViewJob: (job: JobDescription) => void;
  onEditJob: (job: JobDescription) => void;
}

export const JobList: React.FC<JobListProps> = ({ onViewJob, onEditJob }) => {
  const [jobs] = useState<JobDescription[]>(mockJobDescriptions);
  const [filteredJobs, setFilteredJobs] = useState<JobDescription[]>(mockJobDescriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  React.useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      closed: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      remote: 'bg-blue-100 text-blue-800',
      onsite: 'bg-purple-100 text-purple-800',
      hybrid: 'bg-yellow-100 text-yellow-800',
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs by title, company, location, or skills..."
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
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-gray-600 font-medium">{job.company}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                  {job.status}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(job.type)}`}>
                  {job.type}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {job.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                ₹{job.stipend.toLocaleString()}/month
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {job.duration}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {job.applicants} applicants
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">REQUIRED SKILLS</p>
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="text-xs text-gray-500">+{job.skills.length - 4} more</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewJob(job)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditJob(job)}
                  className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No job descriptions found matching your criteria.</div>
        </div>
      )}
    </div>
  );
};