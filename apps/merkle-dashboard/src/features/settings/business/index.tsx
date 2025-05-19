import ContentSection from '../components/content-section'
import { BusinessForm } from './business-form'

export default function SettingsBusiness() {
  return (
    <ContentSection title='Business' desc='Customize the business information'>
      <BusinessForm />
    </ContentSection>
  )
}
