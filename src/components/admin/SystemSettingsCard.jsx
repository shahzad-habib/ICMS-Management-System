import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useToast } from '../ui/Toast';
import api from '../../api/axios';
import {
  Settings,
  ShieldCheck,
  Globe,
  Clock,
  Wifi,
  Plus,
  X,
  RotateCcw,
  Save,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function SystemSettingsCard({ className = '' }) {
  const { toast } = useToast();

  // Settings State
  const [requiredWorkingHours, setRequiredWorkingHours] = useState(6);
  const [fridayRequiredHours, setFridayRequiredHours] = useState(3);
  const [allowedIPs, setAllowedIPs] = useState([]);
  const [isIpRestrictionEnabled, setIsIpRestrictionEnabled] = useState(false);
  const [detectedIP, setDetectedIP] = useState('');

  // Initial fetched snapshot to detect unsaved changes
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  // Interaction State
  const [newIPInput, setNewIPInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/settings');
      const data = res.data?.settings || {};

      const hours = data.requiredDailyHours ?? 6;
      const friHours = data.fridayRequiredHours ?? 3;
      const ips = Array.isArray(data.allowedIPs) ? data.allowedIPs : [];
      const restriction = Boolean(data.isIpRestrictionEnabled);

      setRequiredWorkingHours(hours);
      setFridayRequiredHours(friHours);
      setAllowedIPs(ips);
      setIsIpRestrictionEnabled(restriction);

      if (res.data?.currentClientIP) {
        setDetectedIP(res.data.currentClientIP);
      }

      setInitialSnapshot({
        requiredWorkingHours: hours,
        fridayRequiredHours: friHours,
        allowedIPs: [...ips],
        isIpRestrictionEnabled: restriction,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load system settings from server.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Check if any value is modified compared to initial snapshot
  const hasChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    if (Number(requiredWorkingHours) !== Number(initialSnapshot.requiredWorkingHours)) return true;
    if (Number(fridayRequiredHours) !== Number(initialSnapshot.fridayRequiredHours)) return true;
    if (Boolean(isIpRestrictionEnabled) !== Boolean(initialSnapshot.isIpRestrictionEnabled)) return true;
    if (allowedIPs.length !== initialSnapshot.allowedIPs.length) return true;
    const sortedCurrent = [...allowedIPs].sort().join(',');
    const sortedInitial = [...initialSnapshot.allowedIPs].sort().join(',');
    return sortedCurrent !== sortedInitial;
  }, [initialSnapshot, requiredWorkingHours, fridayRequiredHours, isIpRestrictionEnabled, allowedIPs]);

  // Add an IP
  const handleAddIP = (e) => {
    if (e) e.preventDefault();
    const cleanIP = newIPInput.trim();
    if (!cleanIP) return;

    if (allowedIPs.includes(cleanIP)) {
      toast({
        title: 'Duplicate IP',
        description: 'This IP is already in the authorized list.',
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

  // Quick Whitelist Detected IP
  const handleWhitelistCurrentIP = () => {
    if (!detectedIP) return;
    if (!allowedIPs.includes(detectedIP)) {
      setAllowedIPs([...allowedIPs, detectedIP]);
      toast({
        title: 'IP Added',
        description: `Added ${detectedIP} to whitelist. Click Save to apply.`,
      });
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        requiredWorkingHours: Number(requiredWorkingHours),
        fridayRequiredHours: Number(fridayRequiredHours),
        allowedIPs,
        isIpRestrictionEnabled,
      };

      await api.put('/admin/settings', payload);

      setInitialSnapshot({
        requiredWorkingHours: Number(requiredWorkingHours),
        fridayRequiredHours: Number(fridayRequiredHours),
        allowedIPs: [...allowedIPs],
        isIpRestrictionEnabled,
      });

      toast({
        title: 'Settings Saved',
        description: 'System policies updated successfully.',
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
    <Card className={`shadow-xs border border-[#e2e8f0] sticky top-4 bg-white ${className}`}>
      {/* Card Header */}
      <CardHeader className="pb-3 border-b border-[#f1f5f9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#003E78]/10 text-[#003E78] flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#003E78]" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-[#0f172a] leading-tight">
                System Settings
              </CardTitle>
              <p className="text-[11px] text-[#64748b]">Live policy & network rules</p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={isLoading}
              title="Reload settings from server"
              className="p-1.5 text-[#64748b] hover:text-[#003E78] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#003E78]' : ''}`} />
            </button>
            <Link
              to="/admin/settings"
              title="Open full settings page"
              className="p-1.5 text-[#64748b] hover:text-[#003E78] hover:bg-slate-100 rounded-md transition-colors flex items-center cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 space-y-3.5">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#003E78]" />
            <span className="text-xs font-medium">Loading live settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-3.5">
            {/* Campus Wi-Fi Restriction Status & Toggle */}
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                isIpRestrictionEnabled
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {isIpRestrictionEnabled ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0f172a]">Wi-Fi Restriction</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isIpRestrictionEnabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isIpRestrictionEnabled ? 'Enforced' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#64748b] truncate">
                      {isIpRestrictionEnabled
                        ? 'Restricted to school Wi-Fi'
                        : 'Allowed from any network'}
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsIpRestrictionEnabled(!isIpRestrictionEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isIpRestrictionEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle IP Restriction"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isIpRestrictionEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Working Hours Policy (Standard & Friday) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#003E78]">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold text-[#0f172a]">Required Working Hours</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Standard Hours */}
                <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-[#475569]">Mon - Thu, Sat</Label>
                    <span className="text-[9px] bg-blue-50 text-[#003E78] font-bold px-1 rounded">Daily</span>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    max="16"
                    step="0.5"
                    value={requiredWorkingHours}
                    onChange={(e) => setRequiredWorkingHours(e.target.value)}
                    required
                    className="h-8 text-xs font-bold text-[#003E78] bg-white py-1"
                  />
                </div>

                {/* Friday Hours */}
                <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-[#475569]">Friday</Label>
                    <span className="text-[9px] bg-emerald-50 text-[#0e7816] font-bold px-1 rounded">Half-Day</span>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    step="0.5"
                    value={fridayRequiredHours}
                    onChange={(e) => setFridayRequiredHours(e.target.value)}
                    required
                    className="h-8 text-xs font-bold text-[#003E78] bg-white py-1"
                  />
                </div>
              </div>
            </div>

            {/* IP Whitelist Management */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#003E78]">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-[#0f172a]">Allowed Wi-Fi IPs</span>
                </div>
                <span className="text-[10px] font-semibold text-[#64748b] bg-slate-100 px-1.5 py-0.5 rounded">
                  {allowedIPs.length} Configured
                </span>
              </div>

              {/* Detected Admin IP Banner */}
              {detectedIP && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-blue-700 block font-medium">Your Current IP:</span>
                    <span className="font-mono text-[11px] font-bold text-[#003E78] truncate block">
                      {detectedIP}
                    </span>
                  </div>
                  {!allowedIPs.includes(detectedIP) ? (
                    <button
                      type="button"
                      onClick={handleWhitelistCurrentIP}
                      className="shrink-0 text-[10px] font-bold bg-[#003E78] text-white px-2 py-1 rounded hover:bg-[#002850] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      Add My IP
                    </button>
                  ) : (
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Whitelisted
                    </span>
                  )}
                </div>
              )}

              {/* IP Tags / Chips */}
              <div className="space-y-1.5">
                {allowedIPs.length === 0 ? (
                  <div className="p-2.5 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 text-[11px] text-amber-800 text-center">
                    <AlertCircle className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-600" />
                    No IPs configured. Teachers can check in from any Wi-Fi.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {allowedIPs.map((ip) => {
                      const isCurrent = ip === detectedIP;
                      return (
                        <span
                          key={ip}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-all ${
                            isCurrent
                              ? 'bg-blue-50 text-[#003E78] border-blue-200 shadow-2xs'
                              : 'bg-white text-[#334155] border-[#e2e8f0]'
                          }`}
                        >
                          <span className="truncate max-w-[140px]">{ip}</span>
                          {isCurrent && (
                            <span className="text-[8px] font-sans font-bold bg-blue-200/80 text-[#003E78] px-1 rounded">
                              You
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveIP(ip)}
                            className="text-gray-400 hover:text-red-500 rounded p-0.5 transition-colors cursor-pointer"
                            title={`Remove ${ip}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add IP Input Form */}
              <div className="flex gap-1.5 pt-0.5">
                <Input
                  type="text"
                  placeholder="e.g. 192.168.1.100"
                  value={newIPInput}
                  onChange={(e) => setNewIPInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIP();
                    }
                  }}
                  className="h-8 text-xs font-mono py-1 flex-1 bg-white"
                />
                <Button
                  type="button"
                  onClick={handleAddIP}
                  disabled={!newIPInput.trim()}
                  className="h-8 px-2.5 text-xs bg-slate-100 hover:bg-slate-200 text-[#0f172a] border border-[#e2e8f0] font-semibold gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </Button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-1 space-y-2">
              <Button
                type="submit"
                disabled={isSaving || !hasChanges}
                className={`w-full py-2 text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  hasChanges
                    ? 'bg-[#EAD508] hover:bg-[#003D76] text-[#0f172a] hover:text-white ring-2 ring-[#EAD508]/40'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{hasChanges ? 'Save Settings' : 'Settings Up to Date'}</span>
                  </>
                )}
              </Button>

              {hasChanges && (
                <p className="text-[10px] text-amber-600 font-medium text-center flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  You have unsaved changes
                </p>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
