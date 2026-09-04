import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return <section className="not-found"><h1>{t('notFound')}</h1><p><Link to="/">{t('backHome')}</Link></p></section>
}
