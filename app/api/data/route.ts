import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { session_id, distance } = body

    const { data, error } = await supabase
      .from('readings')
      .insert([{ session_id, distance }])

    if (error) {
      console.error('Supabase error:', error)
      return new Response(JSON.stringify({ error }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Request error:', err)
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }
}