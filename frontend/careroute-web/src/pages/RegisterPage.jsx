import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/authContext.js'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', preferredLanguage: 'en' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true)
    try { await register(form); navigate('/profile', { replace: true }) }
    catch (requestError) { setError(requestError.response?.data?.error?.message ?? t('auth.unavailable')) }
    finally { setSubmitting(false) }
  }
  return <section className="auth-panel"><h1>{t('auth.register')}</h1><p>{t('auth.patientOnly')}</p><form onSubmit={submit} className="auth-form"><label>{t('auth.name')}<input name="name" autoComplete="name" required minLength="2" maxLength="100" value={form.name} onChange={update} /></label><label>{t('auth.email')}<input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} /></label><label>{t('auth.password')}<input name="password" type="password" autoComplete="new-password" required minLength="8" maxLength="128" aria-describedby="password-help" value={form.password} onChange={update} /></label><small id="password-help">{t('auth.passwordHelp')}</small><label>{t('auth.preferredLanguage')}<select name="preferredLanguage" value={form.preferredLanguage} onChange={update}><option value="en">English</option><option value="si">සිංහල</option><option value="ta">தமிழ்</option></select></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" disabled={submitting}>{submitting ? t('auth.loading') : t('auth.register')}</button></form><p>{t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link></p></section>
}
