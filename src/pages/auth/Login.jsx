import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!employeeId || !password) {
      setError('Please enter both Employee ID and Password.');
      return;
    }
    setIsLoading(true);
    const result = await login(employeeId, password);
    setIsLoading(false);
    if (result.success) {
      if (result.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/teacher/dashboard');
    } else {
      setError(result.message);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.30)',
    color: '#ffffff',
    fontSize: '14px',
    padding: '6px 0 8px',
    outline: 'none',
    transition: 'border-color .2s',
    boxSizing: 'border-box',
  };

  return (
    <>
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.30) !important; }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .spin { animation: spin 1s linear infinite; }

        /* ── Completely remove any background box on all states (autofill, focus, active, hover) ── */
        input,
        input:focus,
        input:active,
        input:hover {
          background: transparent !important;
          background-color: transparent !important;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
          transition: background-color 99999999s ease-in-out 0s !important;
          -webkit-box-shadow: none !important;
          box-shadow: none !important;
          background: transparent !important;
          background-color: transparent !important;
        }

        input:autofill {
          color: #ffffff !important;
          background: transparent !important;
          background-color: transparent !important;
          -webkit-box-shadow: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* ── Page layout & Responsive Background ── */}
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[url('/assets/login-bg.png')] bg-cover bg-center bg-no-repeat">

        {/* ═══ GLASSMORPHISM CARD ═══ */}
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(10, 25, 47, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.20)',
          borderRadius: '16px',
          padding: '44px 36px 36px',
          boxShadow: '0 20px 50px rgba(0, 25, 50, 0.30), inset 0 1px 0 rgba(255,255,255,0.20)',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Inner top shimmer */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
            borderRadius: '0px',
            pointerEvents: 'none',
          }} />

          {/* ── Logo & Title Header ── */}
          <div style={{ marginBottom: 28, position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <img
              src="/icms-logo.png"
              alt="ICMS Education System"
              style={{
                height: 46,
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
                marginBottom: 16,
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'block',
              }}
            />

            <h1 style={{ color: '#ffffff', fontWeight: 700, fontSize: '24px', lineHeight: 1.25, margin: '0 0 6px' }}>
              Smart Attendance Management System
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0 }}>
              Faculty &amp; Administrative Access Portal
            </p>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div style={{
              background: 'rgba(220,50,50,0.20)',
              border: '1px solid rgba(255,100,100,0.30)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ffaaaa',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 20,
              position: 'relative',
              zIndex: 1,
            }}>
              <Shield style={{ width: 14, height: 14, marginTop: 1, flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* ── Form ── */}
          <form method="post" action="" autoComplete="on" onSubmit={handleSubmit}
            style={{ position: 'relative', zIndex: 1 }}>

            {/* Employee ID */}
            <div style={{ marginBottom: 28 }}>
              <label htmlFor="employeeId" style={{
                color: 'rgba(255,255,255,0.80)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'block',
                marginBottom: 8,
              }}>
                Employee ID
              </label>
              <input
                id="employeeId"
                name="username"
                type="text"
                placeholder="e.g. EMP123"
                autoComplete="username"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                style={inputStyle}
                onFocus={e  => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.75)')}
                onBlur={e   => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.30)')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label htmlFor="password" style={{
                color: 'rgba(255,255,255,0.80)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'block',
                marginBottom: 8,
              }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={e  => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.75)')}
                onBlur={e   => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.30)')}
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: 46,
                marginTop: 32,
                background: isLoading ? 'rgba(234, 213, 8, 0.45)' : '#EAD508',
                color: isLoading ? 'rgba(0, 0, 0, 0.40)' : '#000000',
                border: 'none',
                borderRadius: '0px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                letterSpacing: '0.02em',
                transition: 'background .2s, color .2s, transform .15s',
                boxShadow: 'none',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.background = '#003D76';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = '#EAD508';
                e.currentTarget.style.color = '#000000';
              }}
            >
              {isLoading
                ? <><Loader2 style={{ width: 16, height: 16 }} className="spin" /> Logging in...</>
                : 'Login'
              }
            </button>
          </form>

          {/* Footer */}
          <p style={{
            color: 'rgba(255,255,255,0.22)',
            fontSize: '11px',
            textAlign: 'center',
            marginTop: 24,
            position: 'relative',
            zIndex: 1,
          }}>
            Secure connection · Requires authorized school network
          </p>
        </div>
      </div>
    </>
  );
}
