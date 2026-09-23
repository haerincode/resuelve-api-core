import { api } from '@/lib/api'

// Verb adapter configuration
function setUpVerb() {
  if (!window.Verb) return

  window.Verb.configure({
    execute: async (tool: string, args: any) => {
      switch (tool) {
        case "get_channel_models": {
          const res = await api.get(`/api/channel/models/${args.id}`)
          return res.data
        }

        case "get_logs": {
          const params = new URLSearchParams()
          if (args.p) params.append('p', String(args.p))
          if (args.page_size) params.append('page_size', String(args.page_size))
          if (args.token_name) params.append('token_name', args.token_name)
          if (args.model_name) params.append('model_name', args.model_name)
          if (args.start_timestamp) params.append('start_timestamp', String(args.start_timestamp))
          if (args.end_timestamp) params.append('end_timestamp', String(args.end_timestamp))
          if (args.channel) params.append('channel', String(args.channel))
          const res = await api.get(`/api/log/?${params}`)
          return res.data
        }

        case "get_models_list": {
          const res = await api.get('/api/models')
          return res.data
        }

        case "get_pricing": {
          const res = await api.get('/api/pricing')
          return res.data
        }

        case "get_status": {
          const res = await api.get('/api/status')
          return res.data
        }

        case "get_topup_history": {
          const params = new URLSearchParams()
          if (args.p) params.append('p', String(args.p))
          if (args.page_size) params.append('page_size', String(args.page_size))
          const res = await api.get(`/api/user/topup?${params}`)
          return res.data
        }

        case "get_topup_info": {
          const res = await api.get('/api/user/topup/info')
          return res.data
        }

        case "get_user_dashboard": {
          const params = new URLSearchParams()
          if (args.start_timestamp) params.append('start_timestamp', String(args.start_timestamp))
          if (args.end_timestamp) params.append('end_timestamp', String(args.end_timestamp))
          const res = await api.get(`/api/user/dashboard?${params}`)
          return res.data
        }

        case "get_user_models": {
          const res = await api.get('/api/user/models')
          return res.data
        }

        case "get_user_self": {
          const res = await api.get('/api/user/self')
          return res.data
        }

        case "list_channels": {
          const res = await api.get('/api/channel/')
          return res.data
        }

        case "list_tokens": {
          const res = await api.get('/api/token/')
          return res.data
        }

        default:
          throw new Error(`Unknown tool: ${tool}`)
      }
    },
  })
}

// Initialize when Verb is ready
if (window.Verb) {
  setUpVerb()
} else {
  window.addEventListener('verb:ready', setUpVerb)
}

// Type declaration for window.Verb
declare global {
  interface Window {
    Verb?: {
      configure: (config: { execute: (tool: string, args: any) => Promise<any> }) => void
    }
  }
}
