// apps/web/app/page.tsx
"use client";
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  Eye,
  Plus,
  TrendingUp,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardLayout } from '../components/dashboard-layout';
import { API_BASE_URL, cn, formatDate } from '../lib/utils';

interface DashboardStats {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  recentApplications: number;
  upcomingReminders: number;
}

interface Application {
  id: string;
  companyName: string;
  position: string;
  status: string;
  priority: number;
  applicationDate: string;
  user: {
    fullName: string;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user ID - in real app, get from auth
  const userId = '441610c6-3e77-4b69-ae4b-02ca78577b1f';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/api/dashboard/stats/${userId}`);
      const statsData = await statsResponse.json();

      // Fetch recent applications
      const appsResponse = await fetch(`${API_BASE_URL}/api/applications?userId=${userId}`);
      const appsData = await appsResponse.json();

      if (statsData.success) setStats(statsData.data);
      if (appsData.success) setApplications(appsData.data.slice(0, 6)); // Latest 6

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for charts
  const pieData = stats ? Object.entries(stats.applicationsByStatus).map(([status, count], index) => ({
    name: status.replace(/_/g, ' '),
    value: count,
    color: COLORS[index % COLORS.length]
  })) : [];

  const lineData = [
    { name: 'Jan', applications: 4 },
    { name: 'Feb', applications: 8 },
    { name: 'Mar', applications: 12 },
    { name: 'Apr', applications: 6 },
    { name: 'May', applications: 15 },
    { name: 'Jun', applications: 9 },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, John! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your job applications today.
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Applications',
              value: stats?.totalApplications || 0,
              icon: Briefcase,
              color: 'from-blue-500 to-blue-600',
              change: '+12%',
              isPositive: true
            },
            {
              title: 'This Week',
              value: stats?.recentApplications || 0,
              icon: TrendingUp,
              color: 'from-green-500 to-green-600',
              change: '+5%',
              isPositive: true
            },
            {
              title: 'Upcoming Reminders',
              value: stats?.upcomingReminders || 0,
              icon: Bell,
              color: 'from-yellow-500 to-yellow-600',
              change: '3 today',
              isPositive: true
            },
            {
              title: 'Response Rate',
              value: '68%',
              icon: CheckCircle,
              color: 'from-purple-500 to-purple-600',
              change: '+8%',
              isPositive: true
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={cn(
                      "text-xs mt-1 flex items-center",
                      stat.isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {stat.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {stat.change}
                    </p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg bg-gradient-to-r",
                    stat.color
                  )}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Application Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Application Trends</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  View Details
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  View All
                </button>
              </div>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#111827'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
            <Link href="/applications" className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Eye className="h-4 w-4" />
              <span>View All</span>
            </Link>
          </div>

          {applications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => (
                <motion.div
                  key={app.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={`/applications/${app.id}`}>
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">{app.position}</h3>
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full",
                          app.priority >= 4 ? "bg-red-100 text-red-800" :
                            app.priority >= 3 ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                        )}>
                          Priority {app.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.companyName}</p>
                      <p className="text-xs text-gray-500">Applied on {formatDate(app.applicationDate)}</p>
                      <div className="mt-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-6">Start tracking your job applications to see them here.</p>
              <Link href="/applications/new" className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Your First Application</span>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Add New Application',
                description: 'Track a new job application',
                icon: Plus,
                color: 'from-green-500 to-green-600',
                href: '/applications/new'
              },
              {
                title: 'View All Users',
                description: 'Manage user accounts',
                icon: Users,
                color: 'from-blue-500 to-blue-600',
                href: '/users'
              },
              {
                title: 'Check Reminders',
                description: 'View upcoming tasks',
                icon: Calendar,
                color: 'from-purple-500 to-purple-600',
                href: '/reminders'
              }
            ].map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <Link href={action.href}>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-r transition-transform group-hover:scale-110",
                        action.color
                      )}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}