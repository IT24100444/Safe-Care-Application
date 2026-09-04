import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/authContext.js'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const leave = () => { logout(); navigate('/', { replace: true }) }
  return <section className="profile-panel"><h1>{t('auth.profile')}</h1><dl><div><dt>{t('auth.name')}</dt><dd>{user.name}</dd></div><div><dt>{t('auth.email')}</dt><dd>{user.email}</dd></div><div><dt>{t('auth.role')}</dt><dd>{user.role}</dd></div><div><dt>{t('auth.preferredLanguage')}</dt><dd>{user.preferredLanguage}</dd></div></dl><button type="button" onClick={leave}>{t('auth.logout')}</button></section>
}
