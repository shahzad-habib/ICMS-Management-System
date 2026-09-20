import { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import LeaveForm from '../../components/LeaveForm';
import api from '../../api/axios';
import { Clock, CheckCircle2, AlertCircle, CalendarCheck, ShieldCheck } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  // Dashboard states
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Not Checked In');
  const [checkInTimeStr, setCheckInTimeStr] = useState('');
  const [checkOutTimeStr, setCheckOutTimeStr] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(0);

  // Modal states for check-out reason
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkOutReason, setCheckOutReason] = useState('');

  // Fetch today's status & weekly hours
  const fetchAttendanceStatus = useCallback(async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.get('/attendance/my-records');
      const records = res.data || [];

      // Find today's record
      const todayRecord = records.find((r) => r.date === todayStr);
      if (todayRecord) {
        setIsCheckedIn(true);
        const inTime = todayRecord.checkInTime
          ? new Date(todayRecord.checkInTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';
        setCheckInTimeStr(inTime);

        if (todayRecord.checkOutTime) {
          setIsCheckedOut(true);
          const outTime = new Date(todayRecord.checkOutTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          setCheckOutTimeStr(outTime);
          setStatusMessage(`Checked Out at ${outTime} (${todayRecord.workingHours || 0} hrs • ${todayRecord.status})`);
        } else if (todayRecord.checkInTime) {
          setIsCheckedOut(false);
          setCheckOutTimeStr('');
          setStatusMessage(`Checked In at ${inTime}`);
        }
      } else {
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setCheckInTimeStr('');
        setCheckOutTimeStr('');
        setStatusMessage('Not Checked In');
      }

      // Calculate current week hours (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const thisWeekRecords = records.filter((r) => {
        const recordDate = new Date(r.date);
        return recordDate >= monday && recordDate <= now;
      });

      const totalHours = thisWeekRecords.reduce((acc, curr) => acc + (curr.workingHours || 0), 0);
      setWeeklyHours(parseFloat(totalHours.toFixed(1)));
    } catch {
      // Non-blocking background fetch
    }
  }, []);

  useEffect(() => {
    fetchAttendanceStatus();
  }, [fetchAttendanceStatus]);

  const handleCheckIn = async () => {
    setIsActionLoading(true);
    try {
      const res = await api.post('/attendance/check-in');
      const inTime = res.data?.attendance?.checkInTime
        ? new Date(res.data.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIsCheckedIn(true);
      setCheckInTimeStr(inTime);
      setStatusMessage(`Checked In at ${inTime}`);
      toast({ title: 'Success', description: 'Checked in successfully.' });
      fetchAttendanceStatus();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to check in.';
      toast({
        title: error.response?.status === 403 ? 'Access Denied' : 'Check-In Error',
        description: msg,
        variant: 'destructive',
      });
      if (
        error.response?.status === 400 &&
        (msg.includes('already signed in') || msg.includes('already checked in'))
      ) {
        setIsCheckedIn(true);
        fetchAttendanceStatus();
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckOutInit = () => {
    setIsModalOpen(true);
  };

  const executeCheckOut = async (reason = '') => {
    setIsActionLoading(true);
    try {
      const payload = reason ? { checkOutReason: reason } : {};
      const res = await api.post('/attendance/check-out', payload);
      const outTime = res.data?.attendance?.checkOutTime
        ? new Date(res.data.attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIsCheckedOut(true);
      setCheckOutTimeStr(outTime);
      const hours = res.data?.attendance?.workingHours != null ? res.data.attendance.workingHours : '';
      setStatusMessage(
        `Checked Out at ${outTime}${hours !== '' ? ` (${hours} hrs)` : ''}`
      );
      toast({ title: 'Success', description: 'Checked out successfully.' });
      setIsModalOpen(false);
      setCheckOutReason('');
      fetchAttendanceStatus();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to check out.';
      toast({
        title: error.response?.status === 403 ? 'Access Denied' : 'Check-Out Error',
        description: msg,
        variant: 'destructive',
      });
      if (
        error.response?.status === 400 &&
        msg.includes('already checked out')
      ) {
        setIsCheckedOut(true);
        setIsModalOpen(false);
        fetchAttendanceStatus();
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a]">
            Welcome back, <span className="text-[#003E78]">{user?.name || 'Teacher'}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Employee ID: <span className="font-medium text-[#0f172a]">{user?.employeeId}</span> • Department:{' '}
            <span className="font-medium text-[#0f172a]">{user?.department || 'Faculty'}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Biometric & Wi-Fi Protected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Left Column: Attendance Status & Weekly Summary */}
        <div className="lg:col-span-1 space-y-3.5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Today's Attendance</CardTitle>
                <Clock className="w-4 h-4 text-[#003E78]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-center">
                <p className="text-[11px] text-[#64748b] mb-1 font-semibold uppercase tracking-wider">
                  Live Attendance Status
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  {isCheckedOut ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCheckedIn ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <p className="font-bold text-[#003E78] text-sm">{statusMessage}</p>
                </div>
              </div>

              {/* Atomic Side-by-Side Check-In / Check-Out Buttons */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* [Check-In] Button */}
                  <Button
                    type="button"
                    onClick={handleCheckIn}
                    disabled={isCheckedIn || isActionLoading}
                    className={`w-full py-2.5 px-3 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      !isCheckedIn
                        ? 'bg-[#003E78] hover:bg-[#002850] text-white active:scale-[0.98]'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isActionLoading && !isCheckedIn ? 'Connecting...' : 'Check-In'}
                  </Button>

                  {/* [Check-Out] Button */}
                  <Button
                    type="button"
                    onClick={handleCheckOutInit}
                    disabled={!isCheckedIn || isCheckedOut || isActionLoading}
                    className={`w-full py-2.5 px-3 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      isCheckedIn && !isCheckedOut
                        ? 'bg-[#f38600] hover:bg-[#d97700] text-white active:scale-[0.98]'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isActionLoading && isCheckedIn && !isCheckedOut ? 'Processing...' : 'Check-Out'}
                  </Button>
                </div>

                {/* Inline Status Timestamp Text */}
                {isCheckedIn && (
                  <div className="text-center text-xs font-semibold py-2 px-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#334155] flex items-center justify-center gap-1.5 flex-wrap">
                    <span>🟢 Checked In at {checkInTimeStr || 'Today'}</span>
                    {isCheckedOut && (
                      <>
                        <span className="text-[#94a3b8]">|</span>
                        <span>🔴 Checked Out at {checkOutTimeStr || 'Today'}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Weekly Summary</CardTitle>
                <CalendarCheck className="w-4 h-4 text-[#f38600]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-[#475569] bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                <div>
                  <p className="text-xs text-[#64748b]">Total Working Hours</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">Current Academic Week</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#0f172a] text-xl">{weeklyHours}</span>
                  <span className="text-xs font-semibold text-[#64748b] ml-1">hrs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Leave Application */}
        <div className="lg:col-span-2">
          <LeaveForm onLeaveSubmitted={fetchAttendanceStatus} />
        </div>
      </div>

      {/* Sign-Out Reason Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isActionLoading && setIsModalOpen(false)}
        title="Sign-Out Message"
        description=""
      >
        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={checkOutReason}
              onChange={(e) => setCheckOutReason(e.target.value)}
              placeholder="Enter your sign-out message or reason..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="bg-white border border-[#e2e8f0] text-gray-700 hover:bg-gray-50"
              onClick={() => setIsModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => executeCheckOut(checkOutReason)}
              disabled={!checkOutReason.trim() || isActionLoading}
              className="bg-[#f38600] hover:bg-[#d97700] text-white"
            >
              {isActionLoading ? 'Submitting...' : 'Confirm Sign-Out'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
