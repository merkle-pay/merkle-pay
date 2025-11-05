import { createFileRoute } from '@tanstack/react-router'
import SettingsEditBusiness from '@/features/settings/edit-business'

export const Route = createFileRoute('/_authenticated/settings/edit-business')({
  component: SettingsEditBusiness,
})
