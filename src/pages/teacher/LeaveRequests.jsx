import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LeaveForm from '../../components/LeaveForm';
import api from '../../api/axios';
import { useToast } from '../../components/ui/Toast';
import { CalendarOff, Clock, CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react';

export default function LeaveRequests() {
  const { toast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves/my-leaves');
      setLeaves(res.data || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load leave applications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
          <CalendarOff className="w-5 h-5 text-[#003E78]" />
          Leave Applications & History
        </h1>
        <p className="text-xs text-[#64748b] mt-0.5">
          Apply for leaves and track your submitted applications and approval statuses in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Left: Apply Leave Form */}
        <div className="lg:col-span-1">
          <LeaveForm onLeaveSubmitted={fetchMyLeaves} />
        </div>

        {/* Right: Previous Leaves Table */}
        <div className="lg:col-span-2">
          <Card className="shadow-xs border border-[#e2e8f0]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">My Leave Applications</CardTitle>
                <button
                  onClick={fetchMyLeaves}
                  disabled={loading}
                  className="p-1 text-[#64748b] hover:text-[#003E78] rounded-lg hover:bg-gray-100 transition-colors"
                  title="Refresh"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      <th className="py-2 px-3">Leave Type</th>
                      <th className="py-2 px-3">Dates</th>
                      <th className="py-2 px-3">Reason</th>
                      <th className="py-2 px-3">Submitted</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-xs sm:text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#64748b]">
                          <div className="flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4 animate-spin text-[#003E78]" />
                            <span>Loading leave requests...</span>
                          </div>
                        </td>
                      </tr>
                    ) : leaves.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#94a3b8]">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <AlertCircle className="w-6 h-6 text-gray-400" />
                            <p>No leave applications submitted yet.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      leaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#003E78]">{leave.leaveType}</span>
                          </td>
                          <td className="py-3 px-4 text-[#475569] text-xs whitespace-nowrap">
                            <div className="font-medium text-[#0f172a]">{formatDate(leave.startDate)}</div>
                            <div className="text-[#94a3b8]">to {formatDate(leave.endDate)}</div>
                          </td>
                          <td className="py-3 px-4 text-xs text-[#475569] max-w-xs truncate">
                            {leave.reason}
                          </td>
                          <td className="py-3 px-4 text-xs text-[#94a3b8] whitespace-nowrap">
                            {formatDate(leave.createdAt)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(leave.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
