import { createFileRoute } from '@tanstack/react-router'
import SettingsCreateBusiness from '@/features/settings/create-business'

export const Route = createFileRoute(
  '/_authenticated/settings/create-business'
)({
  component: SettingsCreateBusiness,
})
