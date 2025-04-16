import { createLazyFileRoute } from '@tanstack/react-router'
import Payments from '@/features/payments'

export const Route = createLazyFileRoute('/_authenticated/payments/')({
  component: Payments,
})
