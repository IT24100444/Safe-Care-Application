import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/authContext.js'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true)
    try { await login(form); navigate(location.state?.from?.pathname ?? '/profile', { replace: true }) }
    catch (requestError) { setError(requestError.response?.data?.error?.message ?? t('auth.unavailable')) }
    finally { setSubmitting(false) }
  }
  return <section className="auth-panel"><h1>{t('auth.login')}</h1><form onSubmit={submit} className="auth-form"><label>{t('auth.email')}<input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} /></label><label>{t('auth.password')}<input name="password" type="password" autoComplete="current-password" required value={form.password} onChange={update} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" disabled={submitting}>{submitting ? t('auth.loading') : t('auth.login')}</button></form><p>{t('auth.needAccount')} <Link to="/register">{t('auth.register')}</Link></p></section>
}
