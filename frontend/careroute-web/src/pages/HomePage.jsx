import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation()
  return <section className="hero" aria-labelledby="page-title"><p className="eyebrow">{t('foundation')}</p><h1 id="page-title">{t('appName')}</h1><p className="intro">{t('tagline')}</p><div className="status-card" role="status"><span className="status-dot" aria-hidden="true" /><div><strong>{t('frontendStatus')}</strong><span>{t('ready')}</span></div></div></section>
}
