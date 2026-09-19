import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import { ClipboardList, Calendar, Clock, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';

export default function AttendanceHistory() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth).padStart(2, '0'));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/my-records?year=${selectedYear}&month=${selectedMonth}`);
      setRecords(res.data || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance records.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Aggregate metrics for selected period
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'Present').length;
  const halfDays = records.filter((r) => r.status === 'Half Day').length;
  const totalHours = records.reduce((acc, curr) => acc + (curr.workingHours || 0), 0);

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Present
          </span>
        );
      case 'Half Day':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Half Day
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#003E78]" />
            Attendance History
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Review your historical sign-in logs, total daily working hours, and attendance patterns.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-medium py-1 px-2 h-8"
            >
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </Select>

            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-medium py-1 px-2 h-8"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={fetchRecords}
            disabled={loading}
            className="p-1.5 h-8 text-[#003E78] border-[#e2e8f0] hover:bg-gray-50"
            title="Refresh"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs">
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Total Records</p>
          <p className="text-xl font-bold text-[#0f172a] mt-0.5">{totalDays}</p>
          <span className="text-[10px] text-[#94a3b8]">in selected month</span>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs">
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Full Days Present</p>
          <p className="text-xl font-bold text-[#0e7816] mt-0.5">{presentDays}</p>
          <span className="text-[10px] text-[#94a3b8]">standard shifts</span>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs">
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Half Days / Early</p>
          <p className="text-xl font-bold text-[#f38600] mt-0.5">{halfDays}</p>
          <span className="text-[10px] text-[#94a3b8]">under minimum hours</span>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs">
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Total Hours</p>
          <p className="text-xl font-bold text-[#003E78] mt-0.5">{totalHours.toFixed(1)}</p>
          <span className="text-[10px] text-[#94a3b8]">accumulated work hours</span>
        </div>
      </div>

      {/* Records Table */}
      <Card className="shadow-xs border border-[#e2e8f0]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Check-In</th>
                  <th className="py-2 px-3">Check-Out</th>
                  <th className="py-2 px-3">Working Hours</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#64748b]">
                      <div className="flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#003E78]" />
                        <span>Loading records...</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#94a3b8]">
                      No attendance records found for this period.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r._id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#0f172a]">
                        {r.date}
                        {r.isManualEntry && (
                          <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-normal">
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#475569]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                          <span>{formatTime(r.checkInTime)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#475569]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                          <span>{formatTime(r.checkOutTime)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0f172a]">
                        {r.workingHours != null ? `${r.workingHours} hrs` : 'In Progress'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                      <td className="py-3 px-4 text-xs text-[#64748b] max-w-xs truncate">
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
    </div>
  );
}
