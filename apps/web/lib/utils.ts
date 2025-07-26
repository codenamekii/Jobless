import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Format currency for Indonesian Rupiah
export function formatCurrency(amount: string) {
  return amount.replace(/Rp\s*/g, 'Rp ').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Format date
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get status color
export function getStatusColor(status: string) {
  const colors = {
    'DRAFT': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'APPLIED': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'REVIEWING': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'INTERVIEW_SCHEDULED': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'INTERVIEWED': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    'TECHNICAL_TEST': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'REFERENCE_CHECK': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    'OFFER_RECEIVED': 'bg-green-500/10 text-green-500 border-green-500/20',
    'NEGOTIATING': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'ACCEPTED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'REJECTED': 'bg-red-500/10 text-red-500 border-red-500/20',
    'WITHDRAWN': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'ON_HOLD': 'bg-slate-500/10 text-slate-500 border-slate-500/20'
  }
  return colors[status as keyof typeof colors] || colors.DRAFT
}

// Get priority color
export function getPriorityColor(priority: number) {
  if (priority >= 5) return 'text-red-500'
  if (priority >= 4) return 'text-orange-500'
  if (priority >= 3) return 'text-yellow-500'
  return 'text-green-500'
}

// Get job type icon
export function getJobTypeIcon(jobType: string) {
  const icons = {
    'FULL_TIME': '🕘',
    'PART_TIME': '⏰',
    'CONTRACT': '📝',
    'FREELANCE': '💼',
    'INTERNSHIP': '🎓',
    'REMOTE': '🌐',
    'HYBRID': '🏢'
  }
  return icons[jobType as keyof typeof icons] || '💼'
}