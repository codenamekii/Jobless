"use client";
import { motion } from 'framer-motion';
import {
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
import { useEffect, useState } from 'react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardLayout } from '../components/dashboard-layout';
import { BackgroundGradient } from '../components/ui/background-gradient';
import { HoverEffect } from '../components/ui/card-hover-effect';
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

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

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
    name: status.replace('_', ' '),
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

  // Transform applications for HoverEffect component
  const applicationItems = applications.map(app => ({
    title: `${app.position} at ${app.companyName}`,
    description: `Applied on ${formatDate(app.applicationDate)} • Priority: ${app.priority}/5`,
    link: `/applications/${app.id}`,
    status: app.status.replace('_', ' '),
    priority: app.priority
  }));

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
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome back, John! 👋
            </h1>
            <p className="mt-2 text-gray-400">
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
              color: 'from-purple-500 to-purple-600',
              change: '+12%'
            },
            {
              title: 'This Week',
              value: stats?.recentApplications || 0,
              icon: TrendingUp,
              color: 'from-blue-500 to-blue-600',
              change: '+5%'
            },
            {
              title: 'Upcoming Reminders',
              value: stats?.upcomingReminders || 0,
              icon: Bell,
              color: 'from-green-500 to-green-600',
              change: '3 today'
            },
            {
              title: 'Response Rate',
              value: '68%',
              icon: CheckCircle,
              color: 'from-orange-500 to-orange-600',
              change: '+8%'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <BackgroundGradient className="rounded-2xl">
                <div className="bg-black/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                      <p className="text-xs text-green-400 mt-1 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-r",
                      stat.color
                    )}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </BackgroundGradient>
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
            <BackgroundGradient className="rounded-2xl">
              <div className="bg-black/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Application Trends</h3>
                  <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    View Details
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BackgroundGradient className="rounded-2xl">
              <div className="bg-black/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Status Distribution</h3>
                  <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
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
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </BackgroundGradient>
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
            <h2 className="text-2xl font-bold text-white">Recent Applications</h2>
            <BackgroundGradient className="rounded-lg">
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white">
                <Eye className="h-4 w-4" />
                <span>View All</span>
              </button>
            </BackgroundGradient>
          </div>

          {applications.length > 0 ? (
            <HoverEffect items={applicationItems} />
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
              <p className="text-gray-400 mb-6">Start tracking your job applications to see them here.</p>
              <BackgroundGradient className="inline-block rounded-lg">
                <button className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white">
                  <Plus className="h-4 w-4" />
                  <span>Add Your First Application</span>
                </button>
              </BackgroundGradient>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
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
                <BackgroundGradient className="rounded-xl">
                  <div className="bg-black/50 backdrop-blur-xl p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-r transition-transform group-hover:scale-110",
                        action.color
                      )}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-400">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </BackgroundGradient>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}