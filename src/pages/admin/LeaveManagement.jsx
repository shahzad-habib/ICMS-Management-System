import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import {
  CalendarOff,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Calendar,
  Filter,
  Check,
  X
} from 'lucide-react';

export default function LeaveManagement() {
  const { toast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Pending'); // 'All', 'Pending', 'Approved', 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Fetch all leaves
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch leave applications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Handle Approve / Reject
  const handleStatusUpdate = async (id, newStatus) => {
    setProcessingId(id);
    try {
      await api.put(`/leaves/${id}/status`, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Leave application marked as ${newStatus}.`,
      });
      // Optimistic update
      setLeaves((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
      );
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update status.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Counts
  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  // Filtered List
  const filteredLeaves = leaves.filter((l) => {
    const matchesTab = activeTab === 'All' || l.status === activeTab;
    const term = searchQuery.toLowerCase().trim();
    const nameMatch = l.teacherId?.name?.toLowerCase().includes(term);
    const empIdMatch = l.teacherId?.employeeId?.toLowerCase().includes(term);
    const typeMatch = l.leaveType?.toLowerCase().includes(term);

    const matchesSearch = !term || nameMatch || empIdMatch || typeMatch;
    return matchesTab && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDurationDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  const getLeaveTypeBadge = (type) => {
    switch (type) {
      case 'Sick':
        return <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Sick Leave</span>;
      case 'Casual':
        return <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Casual Leave</span>;
      default:
        return <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Emergency</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-[#003E78]" />
            Faculty Leave Management
          </h1>

        </div>

        <Button
          variant="outline"
          onClick={fetchLeaves}
          disabled={loading}
          className="self-start sm:self-auto border-[#e2e8f0] text-[#003E78] hover:bg-gray-100 text-xs h-8 px-3 gap-1.5 shadow-2xs font-semibold"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('All')}
          className={`cursor-pointer bg-white rounded-xl p-3 border transition-all ${
            activeTab === 'All' ? 'border-[#003E78] ring-1 ring-[#003E78]' : 'border-[#e2e8f0]'
          } shadow-2xs`}
        >
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Total Applications</p>
          <p className="text-xl font-bold text-[#0f172a] mt-0.5">{totalCount}</p>
        </div>

        <div
          onClick={() => setActiveTab('Pending')}
          className={`cursor-pointer bg-white rounded-xl p-3 border transition-all ${
            activeTab === 'Pending' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-[#e2e8f0]'
          } shadow-2xs`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Pending Review</p>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </div>
          <p className="text-xl font-bold text-amber-600 mt-0.5">{pendingCount}</p>
        </div>

        <div
          onClick={() => setActiveTab('Approved')}
          className={`cursor-pointer bg-white rounded-xl p-3 border transition-all ${
            activeTab === 'Approved' ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-[#e2e8f0]'
          } shadow-2xs`}
        >
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Approved</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">{approvedCount}</p>
        </div>

        <div
          onClick={() => setActiveTab('Rejected')}
          className={`cursor-pointer bg-white rounded-xl p-3 border transition-all ${
            activeTab === 'Rejected' ? 'border-rose-600 ring-1 ring-rose-600' : 'border-[#e2e8f0]'
          } shadow-2xs`}
        >
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Rejected</p>
          <p className="text-xl font-bold text-rose-600 mt-0.5">{rejectedCount}</p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <Card className="shadow-2xs border border-[#e2e8f0] p-2 sm:p-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-lg">
            {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-[#003E78] shadow-2xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {tab === 'Pending' ? `Pending (${pendingCount})` : tab}
              </button>
            ))}
          </div>

          {/* Search Query */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-2.5" />
            <Input
              type="text"
              placeholder="Search teacher, ID or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 py-1 w-full"
            />
          </div>
        </div>
      </Card>

      {/* Leaves Table */}
      <Card className="shadow-xs border border-[#e2e8f0]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3">Leave Type</th>
                  <th className="py-2.5 px-3">Duration & Dates</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#64748b]">
                      <div className="flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#003E78]" />
                        <span>Loading leave applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#94a3b8]">
                      No leave applications found in this view.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => {
                    const days = getDurationDays(leave.startDate, leave.endDate);
                    const isBusy = processingId === leave._id;
                    return (
                      <tr key={leave._id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#003E78] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {leave.teacherId?.name?.charAt(0) || 'T'}
                            </div>
                            <div>
                              <p className="font-semibold text-[#0f172a] text-xs leading-tight">
                                {leave.teacherId?.name || 'Staff Member'}
                              </p>
                              <p className="text-[10px] text-[#64748b]">
                                {leave.teacherId?.employeeId || '—'} • {leave.teacherId?.department || 'Faculty'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {getLeaveTypeBadge(leave.leaveType)}
                        </td>
                        <td className="py-3 px-3 text-xs whitespace-nowrap">
                          <div className="font-semibold text-[#0f172a]">
                            {days} {days === 1 ? 'day' : 'days'}
                          </div>
                          <div className="text-[#64748b] text-[11px]">
                            {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-[#475569] max-w-xs">
                          <p className="line-clamp-2" title={leave.reason}>
                            {leave.reason}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-xs text-[#94a3b8] whitespace-nowrap">
                          {formatDate(leave.createdAt)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {getStatusBadge(leave.status)}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {leave.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                disabled={isBusy}
                                className="bg-[#0e7816] hover:bg-green-800 text-white text-[11px] h-7 px-2.5 gap-1 shadow-2xs font-semibold"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                disabled={isBusy}
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] h-7 px-2.5 gap-1 shadow-2xs font-semibold"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#94a3b8] italic">Decided</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
