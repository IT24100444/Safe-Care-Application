import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import si from './si.json'
import ta from './ta.json'
import fourth from './fourth.json'

i18n.use(initReactI18next).init({ resources: { en: { translation: en }, si: { translation: si }, ta: { translation: ta }, fourth: { translation: fourth } }, lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false } })
export default i18n
