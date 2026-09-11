import { createFileRoute } from '@tanstack/react-router'
import { AffiliateAuthPage } from '@/features/affiliates'

export const Route = createFileRoute('/affiliate')({
  component: AffiliateAuthPage,
})
