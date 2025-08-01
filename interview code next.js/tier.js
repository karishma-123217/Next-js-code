// app/page.tsx
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { UserButton } from '@clerk/nextjs'
import './globals.css'

const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// are reading environment variables
)

const tierOrder = ['Free', 'Silver', 'Gold', 'Platinum'] as const

export default async function HomePage() {
  const { userId } = auth()
  if (!userId) return <div className="p-6">Please sign in</div>

  const {
    data: [user],
  } = await supabase.from('users').select('*').eq('id', userId).single()

  const tierIndex = tierOrder.indexOf(user.tier)
  const allowedTiers = tierOrder.slice(0, tierIndex + 1)

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .in('tier', allowedTiers)
    .order('date')

  return (
    <main className="min-h-screen p-6 bg-gray-50 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.email}</h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <h2 className="text-xl text-gray-700 mb-4">Tier: <span className="font-semibold">{user.tier}</span></h2>

      <div className="grid gap-4">
        {events?.map((event) => (
          <div
            key={event.id}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            <p className="text-gray-700 text-sm">{event.description}</p>
            <p className="text-gray-500 text-xs mt-2">
              {new Date(event.date).toLocaleString()} ({event.tier})
            </p>
          </div>
        ))}
      </div>
    </main>
  )

  
}


