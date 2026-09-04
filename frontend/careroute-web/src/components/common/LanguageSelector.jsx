import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const languages = [{ code: 'en', label: 'English' }, { code: 'si', label: 'සිංහල' }, { code: 'ta', label: 'தமிழ்' }]

export default function LanguageSelector() {
  const { i18n, t } = useTranslation()
  return <label className="language-control"><Languages aria-hidden="true" size={18} /><span>{t('language')}</span><select aria-label={t('language')} value={i18n.resolvedLanguage ?? 'en'} onChange={(event) => i18n.changeLanguage(event.target.value)}>{languages.map(({ code, label }) => <option value={code} key={code}>{label}</option>)}</select></label>
}
