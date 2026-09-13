import { createFileRoute, redirect } from '@tanstack/react-router'
import { AffiliateDashboard } from '@/features/affiliates'

export const Route = createFileRoute('/affiliate/dashboard')({
  beforeLoad: ({ context }) => {
    const user = context.auth?.user
    if (!user || (user.role !== 0 && user.role !== 10)) {
      throw redirect({ to: '/affiliate' })
    }
  },
  component: AffiliateDashboard,
})
