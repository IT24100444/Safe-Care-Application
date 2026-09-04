import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../components/common/LanguageSelector.jsx'
import { useAuth } from '../context/authContext.js'

export default function AppLayout() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  return <div className="site-shell"><header className="site-header"><div className="header-inner"><Link className="brand" to="/">{t('appName')}</Link><nav aria-label="Main"><Link to="/facilities">Facilities</Link><Link to="/services">Services</Link>{user?.role === 'ADMIN' && <><Link to="/admin/facilities">Manage facilities</Link><Link to="/admin/services">Manage services</Link></>}{isAuthenticated ? <Link to="/profile">{t('auth.profile')}</Link> : <><Link to="/login">{t('auth.login')}</Link><Link to="/register">{t('auth.register')}</Link></>}</nav><LanguageSelector /></div></header><main className="page-content" id="main-content"><Outlet /></main><footer className="site-footer">{t('footer')}</footer></div>
}
