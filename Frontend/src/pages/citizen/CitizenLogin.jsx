import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sendCitizenLoginOtp, verifyCitizenLoginOtp } from '../../api/citizenAuth.api';
import { useAuth } from '../../context/AuthContext';
import Message from '../../components/Message';
import AuthLayout from '../../components/AuthLayout';

export default function CitizenLogin() {
  const { t } = useTranslation('citizen');
  const [step, setStep] = useState('email'); const [email, setEmail] = useState(''); const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(0); const [loading, setLoading] = useState(false); const [msg, setMsg] = useState(''); const [err, setErr] = useState(false); const { login } = useAuth();
  useEffect(() => { if (!seconds) return; const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(timer) }, [seconds]);

  const request = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(''); setErr(false);
    try { await sendCitizenLoginOtp({ email }); setStep('otp'); setSeconds(600); setMsg(t('otp.otpSentTo', { email })) }
    catch (e) { setErr(true); setMsg(e.response?.data?.message || t('otp.unableToSendOtp')) }
    finally { setLoading(false) }
  };
  const verify = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(''); setErr(false);
    try { const r = await verifyCitizenLoginOtp({ email, otp }); login(r.data.data) }
    catch (e) { setErr(true); setMsg(e.response?.data?.message || t('otp.unableToVerifyOtp')) }
    finally { setLoading(false) }
  };
  const resend = async () => {
    if (seconds > 540) return; setLoading(true); setMsg(''); setErr(false);
    try { await sendCitizenLoginOtp({ email }); setSeconds(600); setOtp(''); setMsg(t('otp.otpResentTo', { email })) }
    catch (e) { setErr(true); setMsg(e.response?.data?.message || t('otp.unableToResendOtp')) }
    finally { setLoading(false) }
  };

  const minutes = Math.floor(seconds / 60), remaining = String(seconds % 60).padStart(2, '0');

  return (
    <AuthLayout>
          {step === 'email' ? (
            <>
              <h2>{t('login.welcomeBack')}</h2>
              <p className="subtitle">{t('login.emailStepSubtitle')}</p>
              <form onSubmit={request}>
                <div className="field"><label htmlFor="email">{t('otp.emailLabel')}</label><input id="email" autoComplete="email" autoCapitalize="none" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <button className="primary-btn full" type="submit" disabled={loading}>{loading ? t('otp.sendingCode') : <>{t('login.sendOtp')} <span>→</span></>}</button>
              </form>
            </>
          ) : (
            <>
              <div className="step-label"><span className="step-dot done">✓</span><span>{t('login.stepEmailEntered')}</span><i className="done-line" /><span className="step-dot active">2</span><span>{t('login.stepVerify')}</span></div>
              <h2>{t('otp.checkInbox')}</h2>
              <p className="subtitle">{t('login.otpSubtitlePrefix')} <strong>{email}</strong>.</p>
              <form onSubmit={verify}>
                <div className="otp-wrap"><label htmlFor="otp">{t('otp.verificationCodeLabel')}</label><input id="otp" className="otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required /></div>
                <div className="otp-meta">
                  <span>{seconds ? t('otp.codeExpiresIn', { time: `${minutes}:${remaining}` }) : t('otp.codeExpired')}</span>
                  <button type="button" className="text-btn" onClick={resend} disabled={loading || seconds > 540}>{t('otp.resendCode')}</button>
                </div>
                <button className="primary-btn full" type="submit" disabled={loading || otp.length !== 6}>{loading ? t('otp.verifying') : <>{t('login.signIn')} <span>→</span></>}</button>
              </form>
              <button className="back-btn" type="button" onClick={() => { setStep('email'); setOtp(''); setMsg(''); setErr(false) }}>{t('otp.changeEmail')}</button>
            </>
          )}
          <Message text={msg} error={err} />
          <div className="link-row">
            {t('login.newToSmartCity')} <Link to="/citizen/signup">{t('login.createAccount')}</Link><br />
            <span style={{ display: 'inline-block', marginTop: 10 }}>{t('login.staffMember')} <Link to="/admin/login">{t('login.adminSignIn')}</Link></span>
          </div>
    </AuthLayout>
  );
}
