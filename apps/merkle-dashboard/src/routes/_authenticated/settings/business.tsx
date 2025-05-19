import { createFileRoute } from '@tanstack/react-router'
import SettingsBusiness from '@/features/settings/business'

export const Route = createFileRoute('/_authenticated/settings/business')({
  component: SettingsBusiness,
})
