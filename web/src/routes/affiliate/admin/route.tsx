import { createFileRoute } from '@tanstack/react-router'
import { AffiliateAdminPanel } from '@/features/affiliates'
import { useAuthStore } from '@/stores/auth-store'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/affiliate/admin')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()

    if (!auth.user || auth.user.role !== 100) {
      throw redirect({
        to: '/affiliate/dashboard',
      })
    }
  },
  component: AffiliateAdminPanel,
})
