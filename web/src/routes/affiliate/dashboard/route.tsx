import { createFileRoute } from '@tanstack/react-router'
import { AffiliateDashboard } from '@/features/affiliates'
import { useAffiliateAuth } from '@/features/affiliates'

export const Route = createFileRoute('/affiliate/dashboard')({
  beforeLoad: () => {
    const { isAuthenticated } = useAffiliateAuth()
    if (!isAuthenticated) {
      throw new Error('Not authenticated as affiliate')
    }
  },
  component: AffiliateDashboard,
})
