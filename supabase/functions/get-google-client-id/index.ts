
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Fetching Google OAuth Client ID...')
    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
    
    if (!clientId) {
      console.error('GOOGLE_OAUTH_CLIENT_ID environment variable not set')
      throw new Error('Google OAuth Client ID not configured')
    }

    console.log('Client ID retrieved successfully')
    return new Response(
      JSON.stringify({ clientId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in get-google-client-id:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
