import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import {
  ClipboardList,
  Calendar,
  Search,
  Download,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wifi,
  ShieldAlert,
  RotateCcw,
  UserCheck,
  ChevronDown
} from 'lucide-react';

export default function AttendanceLogs() {
  const { toast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Manual Attendance Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    teacherId: '',
    date: todayStr,
    checkInTime: '08:00',
    checkOutTime: '14:00',
    reason: 'Manual Entry (Device Issue)'
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Fetch Attendance Records
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/admin/attendance', { params });
      // Backend now returns { records, pagination } for scalability
      if (res.data?.records) {
        setRecords(res.data.records);
        setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
      } else {
        // Fallback for older response format
        setRecords(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load attendance records.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter, searchQuery, toast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/admin/attendance/export', {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ICMS-Attendance-Report-${selectedDate || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report Downloaded',
        description: 'Attendance CSV has been generated successfully.',
      });
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Could not generate CSV report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Submit Manual Attendance
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingManual(true);
    try {
      await api.post('/admin/attendance/manual', manualForm);
      toast({
        title: 'Success',
        description: 'Manual attendance marked successfully.',
      });
      setIsManualModalOpen(false);
      setManualForm({
        teacherId: '',
        date: todayStr,
        checkInTime: '08:00',
        checkOutTime: '14:00',
        reason: 'Manual Entry (Device Issue)'
      });
      fetchAttendance();
    } catch (error) {
      toast({
        title: 'Failed',
        description: error.response?.data?.message || 'Failed to mark manual entry.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Status Metrics
  const totalCount = records.length;
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const halfDayCount = records.filter((r) => r.status === 'Half Day').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle direct inline status override (Present, Absent, Leave)
  const handleStatusChange = async (recordId, newStatus) => {
    if (!recordId || !newStatus) return;

    const previousRecords = [...records];
    // Optimistic UI update
    setRecords((prev) =>
      prev.map((r) => (r._id === recordId ? { ...r, status: newStatus } : r))
    );
    setUpdatingStatusId(recordId);

    try {
      await api.patch(`/admin/attendance/${recordId}/status`, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Status changed to ${newStatus}.`,
      });
    } catch (error) {
      setRecords(previousRecords);
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update attendance status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 focus:ring-emerald-500';
      case 'Absent':
        return 'bg-red-50 text-red-700 border-red-300 focus:ring-red-500';
      case 'Leave':
        return 'bg-purple-50 text-purple-700 border-purple-300 focus:ring-purple-500';
      case 'Half Day':
        return 'bg-amber-50 text-amber-700 border-amber-300 focus:ring-amber-500';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 focus:ring-gray-400';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-500';
      case 'Absent':
        return 'bg-red-500';
      case 'Leave':
        return 'bg-purple-500';
      case 'Half Day':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#003E78]" />
            Staff Attendance Logs
          </h1>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsManualModalOpen(true)}
            variant="outline"
            className="border-[#003E78] text-[#003E78] hover:bg-[#003E78]/5 text-xs h-8 px-3 gap-1.5 shadow-2xs font-semibold"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manual Override</span>
          </Button>

          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="bg-[#003E78] hover:bg-[#002850] text-white text-xs h-8 px-3 gap-1.5 shadow-2xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export Payroll CSV'}</span>
          </Button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs">
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Total Records</p>
          <p className="text-xl font-bold text-[#0f172a] mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs">
          <p className="text-[11px] font-semibold text-[#0e7816] uppercase tracking-wider">Full Day Present</p>
          <p className="text-xl font-bold text-[#0e7816] mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs">
          <p className="text-[11px] font-semibold text-[#f38600] uppercase tracking-wider">Half Day / Early</p>
          <p className="text-xl font-bold text-[#f38600] mt-0.5">{halfDayCount}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs">
          <p className="text-[11px] font-semibold text-[#a5361b] uppercase tracking-wider">Absent / Late</p>
          <p className="text-xl font-bold text-[#a5361b] mt-0.5">{absentCount}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-2xs border border-[#e2e8f0] p-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Date Picker */}
          <div className="sm:col-span-4 flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0f172a] focus:outline-none w-full"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-[#64748b] hover:text-black underline shrink-0 ml-1"
                title="Clear date filter to view all"
              >
                All Dates
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs h-8 py-1"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Half Day">Half Day Only</option>
              <option value="Absent">Absent Only</option>
              <option value="Leave">Leave Only</option>
            </Select>
          </div>

          {/* Search Query */}
          <div className="sm:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-2.5" />
            <Input
              type="text"
              placeholder="Search teacher or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 py-1"
            />
          </div>

          {/* Refresh Button */}
          <div className="sm:col-span-1 flex justify-end">
            <Button
              variant="outline"
              onClick={fetchAttendance}
              disabled={loading}
              className="h-8 w-8 p-0 border-[#e2e8f0] hover:bg-gray-100 text-[#003E78]"
              title="Refresh logs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card className="shadow-xs border border-[#e2e8f0]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Check-In</th>
                  <th className="py-2.5 px-3">Check-Out</th>
                  <th className="py-2.5 px-3">Hours</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Verification / IP</th>
                  <th className="py-2.5 px-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[#64748b]">
                      <div className="flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#003E78]" />
                        <span>Loading attendance records...</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[#94a3b8]">
                      No attendance logs matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r._id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#003E78] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {r.teacherId?.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0f172a] text-xs leading-tight">
                              {r.teacherId?.name || 'Staff Member'}
                            </p>
                            <p className="text-[10px] text-[#64748b]">
                              {r.teacherId?.employeeId || '—'} • {r.teacherId?.department || 'Faculty'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#0f172a] text-xs whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="py-2.5 px-3 text-[#475569] text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#94a3b8]" />
                          <span>{formatTime(r.checkInTime)}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#475569] text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#94a3b8]" />
                          <span>{formatTime(r.checkOutTime)}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#0f172a] text-xs whitespace-nowrap">
                        {r.workingHours != null ? `${r.workingHours} hrs` : <span className="text-amber-600 font-normal">Active</span>}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="relative inline-flex items-center">
                          <span className={`w-2 h-2 rounded-full absolute left-2.5 pointer-events-none ${getStatusDot(r.status)}`} />
                          <select
                            value={r.status || 'Present'}
                            disabled={updatingStatusId === r._id}
                            onChange={(e) => handleStatusChange(r._id, e.target.value)}
                            className={`appearance-none cursor-pointer pl-6 pr-7 py-1 rounded-lg text-xs font-semibold border transition-all shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${getStatusBadgeStyles(r.status)}`}
                            title="Click to override status (Present, Absent, Leave)"
                          >
                            <option value="Present" className="bg-white text-emerald-700 font-medium">Present</option>
                            <option value="Absent" className="bg-white text-red-700 font-medium">Absent</option>
                            <option value="Leave" className="bg-white text-purple-700 font-medium">Leave</option>
                            {r.status === 'Half Day' && (
                              <option value="Half Day" className="bg-white text-amber-700 font-medium">Half Day</option>
                            )}
                          </select>
                          {updatingStatusId === r._id ? (
                            <RotateCcw className="w-3.5 h-3.5 animate-spin absolute right-2 pointer-events-none text-[#64748b]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2 pointer-events-none text-current opacity-70" />
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs">
                        {r.isManualEntry ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <UserCheck className="w-3 h-3" />
                            Manual Override
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-[#003E78] border border-blue-100" title={r.ipAddress}>
                            <Wifi className="w-3 h-3 text-emerald-600" />
                            <span>Wi-Fi Verified</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#64748b] max-w-xs truncate">
                        {r.checkOutReason || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Override Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => !isSubmittingManual && setIsManualModalOpen(false)}
        title="Mark Manual Attendance"
        description="Override attendance for faculty unable to check in via device. Flagged permanently as Manual Entry."
      >
        <form onSubmit={handleManualSubmit} className="space-y-3.5 mt-3">
          <div className="space-y-1">
            <Label className="text-xs">Teacher Employee ID</Label>
            <Input
              required
              placeholder="e.g. TCH01"
              value={manualForm.teacherId}
              onChange={(e) => setManualForm({ ...manualForm, teacherId: e.target.value })}
              className="text-xs py-1.5"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Attendance Date</Label>
            <Input
              type="date"
              required
              value={manualForm.date}
              onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              className="text-xs py-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs">Check-In Time</Label>
              <Input
                type="time"
                value={manualForm.checkInTime}
                onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
                className="text-xs py-1.5"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Check-Out Time</Label>
              <Input
                type="time"
                value={manualForm.checkOutTime}
                onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
                className="text-xs py-1.5"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Reason for Override</Label>
            <Input
              value={manualForm.reason}
              onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })}
              placeholder="e.g. Device Battery Dead, Network Outage"
              className="text-xs py-1.5"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsManualModalOpen(false)}
              disabled={isSubmittingManual}
              className="text-xs h-8 px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingManual}
              className="bg-[#003E78] hover:bg-[#002850] text-white text-xs h-8 px-3 font-semibold"
            >
              {isSubmittingManual ? 'Saving...' : 'Submit Override'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
