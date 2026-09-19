import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import {
  Settings as SettingsIcon,
  Wifi,
  Clock,
  Plus,
  Trash2,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Globe,
  UserCog,
  KeyRound
} from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [requiredWorkingHours, setRequiredWorkingHours] = useState(6);
  const [fridayRequiredHours, setFridayRequiredHours] = useState(3);
  const [allowedIPs, setAllowedIPs] = useState([]);
  const [isIpRestrictionEnabled, setIsIpRestrictionEnabled] = useState(false);
  const [newIPInput, setNewIPInput] = useState('');
  const [detectedIP, setDetectedIP] = useState('');

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      const data = res.data?.settings || {};
      setRequiredWorkingHours(data.requiredDailyHours ?? 6);
      setFridayRequiredHours(data.fridayRequiredHours ?? 3);
      setAllowedIPs(data.allowedIPs || []);
      setIsIpRestrictionEnabled(Boolean(data.isIpRestrictionEnabled));
      if (res.data?.currentClientIP) {
        setDetectedIP(res.data.currentClientIP);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load system settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Add an IP
  const handleAddIP = (e) => {
    e.preventDefault();
    const cleanIP = newIPInput.trim();
    if (!cleanIP) return;

    if (allowedIPs.includes(cleanIP)) {
      toast({
        title: 'Duplicate IP',
        description: 'This IP address is already in the whitelist.',
        variant: 'destructive',
      });
      return;
    }

    setAllowedIPs([...allowedIPs, cleanIP]);
    setNewIPInput('');
  };

  // Remove an IP
  const handleRemoveIP = (ipToRemove) => {
    setAllowedIPs(allowedIPs.filter((ip) => ip !== ipToRemove));
  };

  // Quick Whitelist Current Detected IP
  const handleWhitelistCurrentIP = () => {
    if (!detectedIP) return;
    if (!allowedIPs.includes(detectedIP)) {
      setAllowedIPs([...allowedIPs, detectedIP]);
      toast({
        title: 'IP Added',
        description: `Added current IP (${detectedIP}) to the list. Don't forget to save!`,
      });
    } else {
      toast({
        title: 'Already Added',
        description: 'Your current IP is already whitelisted.',
      });
    }
  };

  // Save Settings to Backend
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/admin/settings', {
        requiredWorkingHours: Number(requiredWorkingHours),
        fridayRequiredHours: Number(fridayRequiredHours),
        allowedIPs,
        isIpRestrictionEnabled,
      });

      toast({
        title: 'Settings Saved',
        description: 'Dynamic system variables updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.response?.data?.message || 'Failed to update settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#003E78]" />
            System Administration Settings
          </h1>

        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/profile')}
            className="self-start sm:self-auto border-[#e2e8f0] text-[#003E78] hover:bg-gray-100 text-xs h-8 px-3 gap-1.5 shadow-2xs font-semibold"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Admin Profile & Password</span>
          </Button>

          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={loading}
            className="self-start sm:self-auto border-[#e2e8f0] text-[#003E78] hover:bg-gray-100 text-xs h-8 px-3 gap-1.5 shadow-2xs font-semibold"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </Button>
        </div>
      </div>

      {/* Admin Profile & Password Banner */}
      <Card className="shadow-xs border border-[#e2e8f0] bg-white">
        <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#003E78] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0f172a]">Administrator Account & Password</h3>

            </div>
          </div>
          <Button
            type="button"
            onClick={() => navigate('/admin/profile')}
            className="h-8 px-3 text-xs font-semibold shrink-0 self-start sm:self-auto flex items-center gap-1.5"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </Button>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Working Hours Settings Card */}
        <Card className="shadow-xs border border-[#e2e8f0]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-[#003E78]">
              <Clock className="w-4 h-4" />
              <CardTitle className="text-base font-bold text-[#0f172a]">Daily Working Hours Policy</CardTitle>
            </div>

          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Regular Working Hours */}
              <div className="space-y-1.5 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#0f172a]">Standard Daily Hours</Label>
                  <span className="text-[10px] bg-blue-50 text-[#003E78] px-2 py-0.5 rounded font-bold">Mon - Thu & Sat</span>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  value={requiredWorkingHours}
                  onChange={(e) => setRequiredWorkingHours(e.target.value)}
                  required
                  className="bg-white text-xs h-9 py-1.5 font-bold text-[#003E78]"
                />
              </div>

              {/* Friday Working Hours */}
              <div className="space-y-1.5 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#0f172a]">Friday Daily Hours</Label>
                  <span className="text-[10px] bg-emerald-50 text-[#0e7816] px-2 py-0.5 rounded font-bold">Friday Policy</span>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  step="0.5"
                  value={fridayRequiredHours}
                  onChange={(e) => setFridayRequiredHours(e.target.value)}
                  required
                  className="bg-white text-xs h-9 py-1.5 font-bold text-[#003E78]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IP Restriction & Whitelist Management Card */}
        <Card className="shadow-xs border border-[#e2e8f0]">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#003E78]">
                <Wifi className="w-4 h-4" />
                <CardTitle className="text-base font-bold text-[#0f172a]">School Wi-Fi IP Restriction</CardTitle>
              </div>

              {/* Toggle switch for Optional vs Enforced */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsIpRestrictionEnabled(!isIpRestrictionEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isIpRestrictionEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                  title="Click to toggle IP restriction on/off"
                >
                  {isIpRestrictionEnabled ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Restriction Enforced</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5 text-gray-500" />
                      <span>Optional (Sign in Anytime)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <CardDescription className="text-xs text-[#64748b] mt-0.5">
              {isIpRestrictionEnabled
                ? 'Check-in and check-out requests will be rejected unless initiated from an authorized IP address.'
                : 'IP restriction is currently optional. Teachers can sign in and mark attendance from any network.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {/* Detected IP Quick Add Bar */}
            {detectedIP && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#F7FAFC] border border-[#e2e8f0]">
                <div className="text-xs">
                  <span className="text-[#64748b]">Detected Admin Client IP:</span>{' '}
                  <span className="font-mono font-bold text-[#0f172a]">{detectedIP}</span>
                </div>
                {!allowedIPs.includes(detectedIP) ? (
                  <Button
                    type="button"
                    onClick={handleWhitelistCurrentIP}
                    size="sm"
                    className="bg-[#003E78] hover:bg-[#002850] text-white text-[11px] h-7 px-2.5 gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Whitelist Current IP</span>
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Already Whitelisted
                  </span>
                )}
              </div>
            )}

            {/* Current Whitelisted IPs */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#0f172a]">
                Whitelisted School IP Addresses ({allowedIPs.length})
              </Label>
              {allowedIPs.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center text-xs text-amber-800">
                  <p className="font-semibold">⚠️ No IP addresses configured.</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    IP restriction is currently bypassed. Add your school Wi-Fi public IP address below to restrict access.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allowedIPs.map((ip) => (
                    <div
                      key={ip}
                      className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs group hover:border-[#003E78] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-xs font-semibold text-[#0f172a] truncate">{ip}</span>
                        {ip === detectedIP && (
                          <span className="text-[9px] bg-blue-100 text-[#003E78] font-bold px-1 rounded">You</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIP(ip)}
                        className="text-gray-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove IP address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add IP Input Form */}
            <div className="pt-2">
              <Label className="text-xs font-semibold text-[#475569] mb-1.5 block">Add New Authorized IP</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. 192.168.1.100 or 203.0.113.5"
                  value={newIPInput}
                  onChange={(e) => setNewIPInput(e.target.value)}
                  className="text-xs font-mono h-9 py-1"
                />
                <Button
                  type="button"
                  onClick={handleAddIP}
                  className="bg-[#EAD508] hover:bg-[#003D76] text-[#0f172a] hover:text-white text-xs h-9 px-3.5 gap-1 shrink-0 font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add IP</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#003E78] hover:bg-[#002850] text-white px-5 py-2 text-sm font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Settings...' : 'Save All Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
