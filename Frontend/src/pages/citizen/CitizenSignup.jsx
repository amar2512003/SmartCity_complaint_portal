import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sendCitizenSignupOtp, verifyCitizenSignupOtp } from '../../api/citizenAuth.api';
import { useAuth } from '../../context/AuthContext';
import Message from '../../components/Message';
import BridgeSketch from '../../components/BridgeSketch';
import LanguageToggle from '../../components/LanguageToggle';
import brandMark from '../../assets/brand-mark.png';

export default function CitizenSignup() {
  const { t } = useTranslation(['citizen', 'common']);
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
      setMsg(t('otp.otpSentTo', { email: form.email }));
      setShowSpamHint(true);
    } catch (e) { setErr(true); setMsg(e.response?.data?.message || t('otp.unableToSendOtp')); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault(); setMsg(''); setErr(false); setLoading(true);
    try {
      const r = await verifyCitizenSignupOtp({ email: form.email, otp });
      login(r.data.data);
    } catch (e) { setErr(true); setMsg(e.response?.data?.message || t('otp.unableToVerifyOtp')); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    if (seconds > 540) return;
    setMsg(''); setErr(false); setLoading(true);
    try {
      await sendCitizenSignupOtp(form); setSeconds(600); setOtp('');
      setMsg(t('otp.otpResentTo', { email: form.email }));
      setShowSpamHint(true);
    }
    catch (e) { setErr(true); setMsg(e.response?.data?.message || t('otp.unableToResendOtp')); }
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
              aria-label={t('shared.close', { ns: 'common' })}
              onClick={() => setShowSpamHint(false)}
            >
              ×
            </button>
            <h3>{t('signup.spamHint.title')}</h3>
            <p>
              {t('signup.spamHint.prefix')} <strong>{t('signup.spamHint.spam')}</strong> {t('signup.spamHint.or')} <strong>{t('signup.spamHint.promotions')}</strong> {t('signup.spamHint.suffix')}
            </p>
            <button
              className="primary-btn full"
              type="button"
              onClick={() => setShowSpamHint(false)}
            >
              {t('signup.spamHint.gotIt')}
            </button>
          </div>
        </div>
      )}

      <section className="auth-visual">
        <Link className="brand" to="/citizen/login"><span className="brand-mark"><img src={brandMark} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} /></span><span></span></Link>
        <div className="auth-copy">
          <span className="eyebrow">{t('signup.eyebrow')}</span>
          <h1>{t('signup.heading')}</h1>
          <p>{t('signup.intro')}</p>
          <div className="security-note"><span>✓</span><div><strong>{t('signup.secureTitle')}</strong><small>{t('signup.secureSubtitle')}</small></div></div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', position: 'relative', zIndex: 1 }}> {t('brand.city')}</span>
        </div>
        <BridgeSketch />
      </section>
      <section className="auth-form-side">
        <LanguageToggle />
        <div className="auth-card">
          <Link className="brand" to="/citizen/login"><span className="brand-mark"><img src={brandMark} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} /></span><span>Samadhan.</span></Link>
          {step === 'details' ? (
            <>
              <div className="step-label"><span className="step-dot active">1</span><span>{t('signup.stepAccountDetails')}</span><i /><span className="step-dot">2</span><span>{t('signup.stepVerifyEmail')}</span></div>
              <h2>{t('signup.createYourAccount')}</h2><p className="subtitle">{t('signup.detailsSubtitle')}</p>
              <form onSubmit={sendOtp}>
                <div className="field"><label>{t('signup.fullNameLabel')}</label><input placeholder={t('signup.fullNamePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} /></div>
                <div className="field"><label>{t('otp.emailLabel')}</label><input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <button className="primary-btn full" type="submit" disabled={loading}>{loading ? t('otp.sendingCode') : <>{t('signup.verifyEmailCta')} <span>→</span></>}</button>
              </form>
            </>
          ) : (
            <>
              <div className="step-label"><span className="step-dot done">✓</span><span>{t('signup.stepAccountDetails')}</span><i className="done-line" /><span className="step-dot active">2</span><span>{t('signup.stepVerifyEmail')}</span></div>
              <h2>{t('otp.checkInbox')}</h2><p className="subtitle">{t('signup.otpSubtitlePrefix')} <strong>{form.email}</strong>.</p>
              <form onSubmit={verifyOtp}>
                <div className="otp-wrap"><label>{t('otp.verificationCodeLabel')}</label><input className="otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required /></div>
                <div className="otp-meta">
                  <span>{seconds ? t('otp.codeExpiresIn', { time: `${minutes}:${remaining}` }) : t('otp.codeExpired')}</span>
                  <button type="button" className="text-btn" onClick={resend} disabled={loading || seconds > 540}>{t('otp.resendCode')}</button>
                </div>
                <button className="primary-btn full" type="submit" disabled={loading || otp.length !== 6}>{loading ? t('otp.verifying') : <>{t('signup.verifyAndCreate')} <span>→</span></>}</button>
              </form>
              <button className="back-btn" type="button" onClick={() => { setStep('details'); setMsg(''); setErr(false) }}>{t('otp.changeEmail')}</button>
            </>
          )}
          <Message text={msg} error={err} />
          <div className="link-row">{t('signup.alreadyHaveAccount')} <Link to="/citizen/login">{t('signup.signIn')}</Link></div>
        </div>
      </section>
    </div>
  );
}
