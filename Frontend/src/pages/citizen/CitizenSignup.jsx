import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendCitizenSignupOtp, verifyCitizenSignupOtp } from '../../api/citizenAuth.api';
import { useAuth } from '../../context/AuthContext';
import Message from '../../components/Message';
import BridgeSketch from '../../components/BridgeSketch';
import brandMark from '../../assets/brand-mark.png';

export default function CitizenSignup() {
  const [step, setStep] = useState('details');
  const [form, setForm] = useState({ name: '', email: '' });
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [showSpamHint, setShowSpamHint] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (!seconds) return;
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const sendOtp = async (e) => {
    e.preventDefault(); setMsg(''); setErr(false); setLoading(true);
    try {
      await sendCitizenSignupOtp(form);
      setStep('otp'); setSeconds(600);
      setMsg(`We sent a 6-digit verification code to ${form.email}`);
      setShowSpamHint(true);
    } catch (e) { setErr(true); setMsg(e.response?.data?.message || 'Unable to send OTP.'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault(); setMsg(''); setErr(false); setLoading(true);
    try {
      const r = await verifyCitizenSignupOtp({ email: form.email, otp });
      login(r.data.data);
    } catch (e) { setErr(true); setMsg(e.response?.data?.message || 'Unable to verify OTP.'); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    if (seconds > 540) return;
    setMsg(''); setErr(false); setLoading(true);
    try {
      await sendCitizenSignupOtp(form); setSeconds(600); setOtp('');
      setMsg(`A new verification code was sent to ${form.email}`);
      setShowSpamHint(true);
    }
    catch (e) { setErr(true); setMsg(e.response?.data?.message || 'Unable to resend OTP.'); }
    finally { setLoading(false); }
  };

  const minutes = Math.floor(seconds / 60);
  const remaining = String(seconds % 60).padStart(2, '0');

  return (
    <div className="auth-page">
      {showSpamHint && (
        <div className="spam-hint-overlay" onClick={() => setShowSpamHint(false)}>
          <div className="spam-hint-popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="spam-hint-close"
              type="button"
              aria-label="Close"
              onClick={() => setShowSpamHint(false)}
            >
              ×
            </button>
            <h3>📩 Didn't get the code?</h3>
            <p>
              Please check your <strong>Spam</strong> or <strong>Promotions</strong> folder —
              verification emails sometimes land there.
            </p>
            <button
              className="primary-btn full"
              type="button"
              onClick={() => setShowSpamHint(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <section className="auth-visual">
        <Link className="brand" to="/citizen/login"><span className="brand-mark"><img src={brandMark} alt="" style={{width:22,height:22,objectFit:'contain'}}/></span><span>SmartCity</span></Link>
        <div className="auth-copy"><span className="eyebrow">Built for better neighborhoods</span><h1>Speak up. Track it. See change.</h1><p>Create a simple account to report problems around your city and follow every update from submission to resolution.</p><div className="security-note"><span>✓</span><div><strong>Passwordless & secure</strong><small>We verify your email with a one-time code.</small></div></div><span style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:16,fontSize:13,fontWeight:700,color:'rgba(255,255,255,.85)',position:'relative',zIndex:1}}> Kolkata</span></div>
        <BridgeSketch/>
      </section>
      <section className="auth-form-side"><div className="auth-card">
        <Link className="brand" to="/citizen/login"><span className="brand-mark"><img src={brandMark} alt="" style={{width:22,height:22,objectFit:'contain'}}/></span><span>SmartCity Portal</span></Link>
        {step === 'details' ? <>
          <div className="step-label"><span className="step-dot active">1</span><span>Account details</span><i /><span className="step-dot">2</span><span>Verify email</span></div>
          <h2>Create your account</h2><p className="subtitle">No password needed. We'll send a one-time code to verify your email.</p>
          <form onSubmit={sendOtp}>
            <div className="field"><label>Full name</label><input placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required minLength={2}/></div>
            <div className="field"><label>Email address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
            <button className="primary-btn full" type="submit" disabled={loading}>{loading ? 'Sending code…' : <>Verify email <span>→</span></>}</button>
          </form>
        </> : <>
          <div className="step-label"><span className="step-dot done">✓</span><span>Account details</span><i className="done-line"/><span className="step-dot active">2</span><span>Verify email</span></div>
          <h2>Check your inbox</h2><p className="subtitle">Enter the 6-digit code we sent to <strong>{form.email}</strong>.</p>
          <form onSubmit={verifyOtp}><div className="otp-wrap"><label>Verification code</label><input className="otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="000000" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} required/></div>
            <div className="otp-meta"><span>{seconds ? `Code expires in ${minutes}:${remaining}` : 'Code expired'}</span><button type="button" className="text-btn" onClick={resend} disabled={loading || seconds > 540}>Resend code</button></div>
            <button className="primary-btn full" type="submit" disabled={loading || otp.length !== 6}>{loading ? 'Verifying…' : <>Verify & create account <span>→</span></>}</button>
          </form><button className="back-btn" type="button" onClick={()=>{setStep('details');setMsg('');setErr(false)}}>← Change email</button>
        </>}
        <Message text={msg} error={err}/><div className="link-row">Already have an account? <Link to="/citizen/login">Sign in</Link></div>
      </div></section>
    </div>
  );
}