"use client";
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Filter,
  MapPin,
  Plus,
  Search,
  Star,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { BackgroundGradient } from '../../components/ui/background-gradient';
import { API_BASE_URL, cn, formatDate, getJobTypeIcon, getStatusColor } from '../../lib/utils';

interface Application {
  id: string;
  companyName: string;
  position: string;
  jobType: string;
  location: string;
  salaryRange: string;
  status: string;
  priority: number;
  applicationDate: string;
  deadlineDate: string | null;
  notes: string;
  tags: string[];
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

const statusOptions = [
  'ALL',
  'DRAFT',
  'APPLIED',
  'REVIEWING',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'TECHNICAL_TEST',
  'REFERENCE_CHECK',
  'OFFER_RECEIVED',
  'NEGOTIATING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
  'ON_HOLD'
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/applications`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group applications by status for better organization
  const groupedApplications = filteredApplications.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = [];
    }
    acc[app.status].push(app);
    return acc;
  }, {} as Record<string, Application[]>);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Job Applications
            </h1>
            <p className="mt-2 text-gray-400">
              Track and manage your job applications in one place
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 sm:mt-0"
          >
            <BackgroundGradient className="rounded-lg">
              <button className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white">
                <Plus className="h-4 w-4" />
                <span>New Application</span>
              </button>
            </BackgroundGradient>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search companies, positions, locations..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status} className="bg-black">
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                      <option value="">All Priorities</option>
                      <option value="5">High (5)</option>
                      <option value="4">Medium-High (4)</option>
                      <option value="3">Medium (3)</option>
                      <option value="2">Low-Medium (2)</option>
                      <option value="1">Low (1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                      <option value="">All Types</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                      <option value="">All Time</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="quarter">Last Quarter</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total', value: applications.length, color: 'from-blue-500 to-blue-600' },
            { label: 'Active', value: applications.filter(a => !['REJECTED', 'WITHDRAWN', 'ACCEPTED'].includes(a.status)).length, color: 'from-green-500 to-green-600' },
            { label: 'Interviews', value: applications.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEWED'].includes(a.status)).length, color: 'from-purple-500 to-purple-600' },
            { label: 'Offers', value: applications.filter(a => a.status === 'OFFER_RECEIVED').length, color: 'from-orange-500 to-orange-600' }
          ].map((stat, index) => (
            <BackgroundGradient key={stat.label} className="rounded-xl">
              <div className="bg-black/50 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                <div className="text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-gradient-to-r mx-auto mb-2 flex items-center justify-center",
                    stat.color
                  )}>
                    <span className="text-white font-bold text-lg">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                </div>
              </div>
            </BackgroundGradient>
          ))}
        </motion.div>

        {/* Applications Grid */}
        {filteredApplications.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group"
              >
                <BackgroundGradient className="rounded-2xl">
                  <div className="bg-black/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">
                          {application.position}
                        </h3>
                        <div className="flex items-center text-gray-400 text-sm mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          {application.companyName}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < application.priority ? "text-yellow-400 fill-current" : "text-gray-600"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        getStatusColor(application.status)
                      )}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        {application.location}
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <span className="mr-2">{getJobTypeIcon(application.jobType)}</span>
                        {application.jobType.replace('_', ' ')}
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Applied {formatDate(application.applicationDate)}
                      </div>
                      {application.salaryRange && (
                        <div className="flex items-center text-gray-400 text-sm">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {application.salaryRange}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {application.tags && application.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {application.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                        {application.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-full">
                            +{application.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors group">
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </BackgroundGradient>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center py-12"
          >
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              {searchQuery || statusFilter !== 'ALL' ? 'No applications found' : 'No applications yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Start tracking your job applications to see them here'
              }
            </p>
            <BackgroundGradient className="inline-block rounded-lg">
              <button className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white">
                <Plus className="h-4 w-4" />
                <span>Add Your First Application</span>
              </button>
            </BackgroundGradient>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}