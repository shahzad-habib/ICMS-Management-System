import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { useToast } from './ui/Toast';
import api from '../api/axios';

export default function LeaveForm({ onLeaveSubmitted }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveType || !reason) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/leaves/apply', { startDate, endDate, leaveType, reason });
      toast({ title: 'Success', description: 'Leave application submitted successfully.' });
      setStartDate('');
      setEndDate('');
      setLeaveType('');
      setReason('');
      if (onLeaveSubmitted) onLeaveSubmitted();
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: error.response?.data?.message || 'Server error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-3.5 sm:p-4 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base font-bold">Apply for Leave</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-[#475569]">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="py-1 px-2.5 text-sm h-10 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-[#475569]">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="py-1 px-2.5 text-sm h-10 rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-[#475569]">Leave Type</Label>
            <Select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="py-1 px-2.5 text-sm h-10 rounded-lg"
            >
              <option value="" disabled>Select Type</option>
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
              <option value="Emergency">Emergency</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-[#475569]">Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason..."
              rows={3}
              className="text-sm py-2 px-2.5 rounded-lg"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5c1383] hover:bg-[#470e67] text-white py-2 h-11 text-sm font-semibold rounded-lg shadow-xs"
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
