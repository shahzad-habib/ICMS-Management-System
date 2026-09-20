import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import api from '../../api/axios';
import { Loader2 } from 'lucide-react';
import SystemSettingsCard from '../../components/admin/SystemSettingsCard';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [stats, setStats] = useState({ totalStaff: 0, presentToday: 0, absentToday: 0, leavesApproved: 0 });
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ teacherId: '', date: '' });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, leavesRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/leaves')
      ]);
      setStats(statsRes.data);
      setLeaves(leavesRes.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      toast({ title: 'Success', description: `Leave ${status.toLowerCase()} successfully.` });
      setLeaves(leaves.map(l => l._id === id ? { ...l, status } : l));
      if (status === 'Approved') {
        const statsRes = await api.get('/admin/dashboard/stats');
        setStats(statsRes.data);
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update leave', variant: 'destructive' });
    }
  };

  const handleManualAttendance = async (e) => {
    e.preventDefault();
    setIsSubmittingManual(true);
    try {
      await api.post('/admin/attendance/manual', manualForm);
      toast({ title: 'Success', description: 'Manual attendance marked successfully.' });
      setIsManualModalOpen(false);
      setManualForm({ teacherId: '', date: '' });
      const statsRes = await api.get('/admin/dashboard/stats');
      setStats(statsRes.data);
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to mark attendance', variant: 'destructive' });
    } finally {
      setIsSubmittingManual(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#003E78]" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-[#a5361b] text-white border-0 shadow-sm p-3.5 sm:p-4 rounded-xl">
          <CardHeader className="pb-1 p-0">
            <CardTitle className="text-xs font-semibold text-white/80 uppercase tracking-wider">Total Staff</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stats.totalStaff}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#5c1383] text-white border-0 shadow-sm p-3.5 sm:p-4 rounded-xl">
          <CardHeader className="pb-1 p-0">
            <CardTitle className="text-xs font-semibold text-white/80 uppercase tracking-wider">Present Today</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stats.presentToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#f38600] text-white border-0 shadow-sm p-3.5 sm:p-4 rounded-xl">
          <CardHeader className="pb-1 p-0">
            <CardTitle className="text-xs font-semibold text-white/80 uppercase tracking-wider">Absent / Late</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stats.absentToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0e7816] text-white border-0 shadow-sm p-3.5 sm:p-4 rounded-xl">
          <CardHeader className="pb-1 p-0">
            <CardTitle className="text-xs font-semibold text-white/80 uppercase tracking-wider">Approved Leaves</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stats.leavesApproved}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leave Management */}
        <div className="lg:col-span-2">
          <Card className="shadow-xs border border-[#e2e8f0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2.5">
              <CardTitle className="text-base font-bold">Leave Management</CardTitle>
              <Button onClick={() => setIsManualModalOpen(true)} className="bg-[#003E78] hover:bg-[#002850] text-xs h-7 px-2.5 shadow-xs">
                Override Attendance
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {leaves.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6 bg-[#F7FAFC] rounded-lg border border-dashed border-gray-200 m-3">No leave applications found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((leave) => (
                      <TableRow key={leave._id}>
                        <TableCell className="font-medium">
                          {leave.teacherId?.name} <br/>
                          <span className="text-[11px] text-[#64748b]">{leave.teacherId?.employeeId}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          <span className="text-[#64748b]">Start:</span> {new Date(leave.startDate).toLocaleDateString()} <br/>
                          <span className="text-[#64748b]">End:</span> {new Date(leave.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-[#003E78]">{leave.leaveType}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            leave.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                            leave.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {leave.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {leave.status === 'Pending' && (
                            <div className="flex justify-end gap-1.5">
                              <Button onClick={() => handleLeaveAction(leave._id, 'Approved')} className="bg-[#0e7816] hover:bg-green-800 text-[11px] px-2.5 py-0.5 h-7 text-white shadow-xs">
                                Approve
                              </Button>
                              <Button variant="outline" onClick={() => handleLeaveAction(leave._id, 'Rejected')} className="border-red-200 text-red-600 hover:bg-red-50 text-[11px] px-2.5 py-0.5 h-7 shadow-xs">
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dynamic System Settings */}
        <div className="lg:col-span-1">
          <SystemSettingsCard />
        </div>
      </div>

      {/* Manual Attendance Modal */}
      <Modal isOpen={isManualModalOpen} onClose={() => !isSubmittingManual && setIsManualModalOpen(false)} title="Override Attendance" description="Mark a manual check-in for a staff member (e.g. if their device is dead).">
        <form onSubmit={handleManualAttendance} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label>Teacher Employee ID</Label>
            <Input required placeholder="e.g. EMP123" value={manualForm.teacherId} onChange={(e) => setManualForm({...manualForm, teacherId: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" required value={manualForm.date} onChange={(e) => setManualForm({...manualForm, date: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" className="bg-white border text-gray-700 hover:bg-gray-50" onClick={() => setIsManualModalOpen(false)} disabled={isSubmittingManual}>Cancel</Button>
            <Button type="submit" disabled={isSubmittingManual} className="bg-[#003E78] hover:bg-[#002850]">{isSubmittingManual ? 'Submitting...' : 'Submit Entry'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
