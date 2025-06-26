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
    const requestBody = await req.json()
    console.log('Request body:', { hasCode: !!requestBody.code, redirectUri: requestBody.redirectUri })
    
    const { code, redirectUri } = requestBody
    
    if (!code) {
      console.error('No authorization code provided')
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

    console.log('Making token exchange request to Google...')
    
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

    console.log('Token response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed with status:', tokenResponse.status, 'Error:', errorText)
      
      // Try to parse the error response
      let errorDetails = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorDetails = errorJson.error_description || errorJson.error || errorText
      } catch (e) {
        // Keep original error text if parsing fails
      }
      
      throw new Error(`Token exchange failed (${tokenResponse.status}): ${errorDetails}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful, got access token')

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData)
      throw new Error('No access token received from Google')
    }

    // Get user info
    console.log('Fetching user info from Google...')
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    console.log('User info response status:', userResponse.status)

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('User info fetch failed with status:', userResponse.status, 'Error:', errorText)
      throw new Error(`Failed to fetch user info (${userResponse.status}): ${errorText}`)
    }

    const userInfo = await userResponse.json()
    console.log('User info fetched successfully for user:', userInfo.email)

    const responseData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      user_info: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      },
    }

    console.log('Sending successful response')
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('OAuth exchange error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Check the function logs for more information'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
