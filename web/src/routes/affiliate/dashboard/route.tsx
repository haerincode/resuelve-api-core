import { createFileRoute, redirect } from '@tanstack/react-router'
import { AffiliateDashboard } from '@/features/affiliates'

export const Route = createFileRoute('/affiliate/dashboard')({
  beforeLoad: ({ context }) => {
    const user = context.auth?.user
    if (!user) {
      throw redirect({ to: '/' })
    }
  },
  component: AffiliateDashboard,
})
