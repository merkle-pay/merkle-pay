import ContentSection from '../components/content-section'
import { CreateBusinessForm } from './create-business-form'

export default function SettingsCreateBusiness() {
  return (
    <ContentSection title='Create Business Form' desc='Create a new business'>
      <CreateBusinessForm />
    </ContentSection>
  )
}
