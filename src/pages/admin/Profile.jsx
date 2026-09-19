import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import {
  UserCog,
  ShieldCheck,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function AdminProfile() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  // ── Password change form state ──────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // ── Password strength evaluator ────────────────────────────
  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: 'bg-red-500' },
      { score: 2, label: 'Fair', color: 'bg-amber-500' },
      { score: 3, label: 'Good', color: 'bg-yellow-400' },
      { score: 4, label: 'Strong', color: 'bg-emerald-500' },
    ];
    return map[score];
  };

  const strength = getStrength(pwForm.newPassword);
  const passwordsMatch =
    pwForm.newPassword &&
    pwForm.confirmPassword &&
    pwForm.newPassword === pwForm.confirmPassword;
  const passwordsMismatch =
    pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword;

  // ── Submit handler ──────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all three password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (pwForm.newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'New password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation password do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (pwForm.currentPassword === pwForm.newPassword) {
      toast({
        title: 'Duplicate Password',
        description: 'New password must be different from your current password.',
        variant: 'destructive',
      });
      return;
    }

    setIsChanging(true);
    try {
      await api.patch('/user/change-password', pwForm);
      toast({
        title: '✅ Password Updated',
        description: 'Your administrator password has been changed successfully.',
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: err.response?.data?.message || 'Failed to update password. Check your current password.',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
          <UserCog className="w-5 h-5 text-[#003E78]" />
          Administrator Profile & Security
        </h1>
        <p className="text-xs text-[#64748b] mt-0.5">
          Manage your administrator account credentials, credentials security, and system access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ── Left Column: Identity & Access Card ─────────────── */}
        <div className="md:col-span-1 space-y-3.5">
          <Card className="text-center p-5 space-y-3 shadow-xs border border-[#e2e8f0]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#003E78] to-[#002850] text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-md select-none">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">{user?.name || 'Administrator'}</h2>
              <p className="text-[11px] text-[#a5361b] font-bold tracking-wider uppercase mt-0.5">
                System Administrator
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Root Access Level
            </span>
          </Card>

          {/* Account Details */}
          <Card className="shadow-xs border border-[#e2e8f0]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-bold text-[#0f172a]">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-[#64748b]">Employee ID</span>
                <span className="font-mono font-bold text-[#0f172a]">{user?.employeeId}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-[#64748b]">System Role</span>
                <span className="font-semibold text-[#0f172a]">{user?.role || 'Admin'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-[#64748b]">Account Status</span>
                <span className="text-emerald-600 font-semibold">Active & Verified</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#64748b]">Encryption</span>
                <span className="font-mono text-[11px] text-[#475569]">bcrypt (12 rounds)</span>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* ── Right Column: Change Password Card ───────────────── */}
        <div className="md:col-span-2">
          <Card className="shadow-xs border border-[#e2e8f0]">
            <CardHeader className="pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2 text-[#003E78]">
                <KeyRound className="w-4 h-4" />
                <CardTitle className="text-base font-bold text-[#0f172a]">Change Admin Password</CardTitle>
              </div>
              <CardDescription className="text-xs text-[#64748b]">
                Enter your current administrator password followed by a strong new password.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold text-[#0f172a]">
                    Current Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                      required
                      autoComplete="current-password"
                      className="pr-10 text-xs h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold text-[#0f172a]">
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      required
                      autoComplete="new-password"
                      className="pr-10 text-xs h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {pwForm.newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Password Strength:</span>
                        <span className="font-semibold text-gray-700">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${(strength.score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-[#0f172a]">
                    Confirm New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your new password"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      required
                      autoComplete="new-password"
                      className={`pr-10 text-xs h-9 ${
                        passwordsMatch
                          ? 'border-emerald-500 focus:ring-emerald-400'
                          : passwordsMismatch
                          ? 'border-red-500 focus:ring-red-400'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Match Indicator */}
                  {passwordsMatch && (
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </p>
                  )}
                  {passwordsMismatch && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Passwords do not match
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isChanging || passwordsMismatch}
                    className="h-9 px-5 text-xs font-semibold flex items-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isChanging ? 'Updating Password...' : 'Update Password'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
