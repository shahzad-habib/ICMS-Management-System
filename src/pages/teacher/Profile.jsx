import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import {
  UserCog, ShieldCheck, Building2, Phone, IdCard,
  Info, KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle,
} from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useContext(AuthContext);
  const { toast } = useToast();

  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
  }, [refreshUser]);

  // ── Password change form ───────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // ── Password strength ──────────────────────────────────────
  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: 'bg-red-400' },
      { score: 2, label: 'Fair', color: 'bg-orange-400' },
      { score: 3, label: 'Good', color: 'bg-yellow-400' },
      { score: 4, label: 'Strong', color: 'bg-green-500' },
    ];
    return map[score];
  };

  const strength = getStrength(pwForm.newPassword);
  const passwordsMatch = pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword;
  const passwordsMismatch = pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: 'Mismatch', description: 'New password and confirmation do not match.', variant: 'destructive' });
      return;
    }
    setIsChanging(true);
    try {
      await api.patch('/user/change-password', pwForm);
      toast({ title: '✅ Password Changed', description: 'Your password has been updated successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to change password.', variant: 'destructive' });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
          <UserCog className="w-5 h-5 text-[#003E78]" />
          Profile & Account
        </h1>
        <p className="text-xs text-[#64748b] mt-0.5">
          View your staff details and manage your account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ── Left: Identity card ─────────────────────────── */}
        <div className="md:col-span-1 space-y-3.5">
          <Card className="text-center p-5 space-y-3 shadow-xs border border-[#e2e8f0]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#003E78] to-[#005fa3] text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-md select-none">
              {user?.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">{user?.name}</h2>
              <p className="text-[11px] text-[#003E78] font-semibold tracking-wide uppercase mt-0.5">
                {user?.department ? `${user.department} Faculty` : `${user?.role || 'Teacher'} Faculty`}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Account
            </span>
          </Card>

          {/* Staff details */}
          <Card className="shadow-xs border border-[#e2e8f0]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-bold">Staff Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {[
                { icon: IdCard,    label: 'Employee ID',          value: user?.employeeId },
                { icon: Building2, label: 'Department / Faculty', value: user?.department || '—' },
                { icon: Phone,     label: 'Phone',                value: user?.phone || 'Not provided' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <Icon className="w-3.5 h-3.5 text-[#003E78] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#64748b] font-medium">{label}</p>
                    <p className="text-xs font-semibold text-[#0f172a] truncate">{value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Change Password card ─────────────────── */}
        <div className="md:col-span-2 space-y-3.5">
          <Card className="shadow-xs border border-[#e2e8f0]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#003E78]" />
                Change Password
              </CardTitle>
              <p className="text-xs text-[#64748b]">
                Choose a strong password. You will not be logged out automatically after changing it.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4" autoComplete="off">

                {/* Current password */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      required
                      autoComplete="current-password"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
                      onClick={() => setShowCurrent(v => !v)}
                      tabIndex={-1}
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New password + strength bar */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
                      onClick={() => setShowNew(v => !v)}
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {pwForm.newPassword && (
                    <div className="space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.color : 'bg-[#e2e8f0]'
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className={`text-[11px] font-medium ${
                          strength.score <= 1 ? 'text-red-500' :
                          strength.score === 2 ? 'text-orange-500' :
                          strength.score === 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {strength.label} password
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      required
                      autoComplete="new-password"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      className={`pr-10 ${passwordsMismatch ? 'border-red-400 focus:ring-red-400' : passwordsMatch ? 'border-green-400' : ''}`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
                      onClick={() => setShowConfirm(v => !v)}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordsMismatch && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
                  {passwordsMatch && (
                    <p className="text-[11px] text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isChanging || !!passwordsMismatch}
                  className="w-full bg-[#003E78] hover:bg-[#002850] mt-2"
                >
                  {isChanging ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
