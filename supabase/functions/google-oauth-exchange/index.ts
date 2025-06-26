
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
    console.log('Processing OAuth exchange request...')
    const { code, redirectUri } = await req.json()
    
    if (!code) {
      throw new Error('Authorization code is required')
    }
    
    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')
    
    if (!clientId || !clientSecret) {
      console.error('Missing OAuth credentials:', { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret 
      })
      throw new Error('Google OAuth credentials not configured')
    }

    console.log('Exchanging code for access token...')
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      throw new Error(`Token exchange failed: ${error}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful')

    if (!tokenData.access_token) {
      throw new Error('No access token received')
    }

    // Get user info
    console.log('Fetching user info...')
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      const error = await userResponse.text()
      console.error('User info fetch failed:', error)
      throw new Error(`Failed to fetch user info: ${error}`)
    }

    const userInfo = await userResponse.json()
    console.log('User info fetched successfully')

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        user_info: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('OAuth exchange error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
