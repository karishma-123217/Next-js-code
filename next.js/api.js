import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string; // Changed from Date to string for JSON serialization
  location: string;
  tier: 'Free' | 'Silver' | 'Gold' | 'Platinum';
}

const TIER_HIERARCHY = ['Free', 'Silver', 'Gold', 'Platinum'] as const;

export default function EventsPage() {
  const [userTier, setUserTier] = useState<'Free' | 'Silver' | 'Gold' | 'Platinum'>('Free');
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on user tier
  useEffect(() => {
    const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
    const accessibleEvents = events.filter(event => 
      TIER_HIERARCHY.indexOf(event.tier) <= userTierIndex
    );
    setFilteredEvents(accessibleEvents);
  }, [userTier, events]);

  const tierColors = {
    Free: 'bg-gray-100 text-gray-800',
    Silver: 'bg-blue-100 text-blue-800',
    Gold: 'bg-yellow-100 text-yellow-800',
    Platinum: 'bg-purple-100 text-purple-800'
  };

  const tierIcons = {
    Free: '🆓',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>Tier-Based Event Filter</title>
        <meta name="description" content="Filter events by membership tier" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Membership Events</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover events available for your membership tier. Higher tiers unlock more exclusive experiences.
          </p>
        </div>

        {/* Tier Selector */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Membership Tier</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {TIER_HIERARCHY.map(tier => (
              <button
                key={tier}
                onClick={() => setUserTier(tier)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center ${
                  userTier === tier 
                    ? `${tierColors[tier]} ring-2 ring-offset-2 ring-current transform scale-105 shadow-md` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2 text-lg">{tierIcons[tier]}</span>
                {tier}
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Current tier: <span className={`font-semibold px-2 py-1 rounded ${tierColors[userTier]}`}>
                {tierIcons[userTier]} {userTier}
              </span>
            </p>
          </div>
        </div>

        {/* Events List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Available Events</h2>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Events</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                Upgrade your membership to access more exclusive events!
              </p>
              <button 
                onClick={() => setUserTier('Silver')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Upgrade to Silver
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tierColors[event.tier]}`}>
                        {tierIcons[event.tier]} {event.tier}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {event.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 mt-auto">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                      Register Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tier Benefits Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Membership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIER_HIERARCHY.map(tier => (
              <div key={tier} className={`p-4 rounded-lg border ${userTier === tier ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">{tierIcons[tier]}</span>
                  <h3 className="text-lg font-semibold">{tier} Tier</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {tier === 'Free' && (
                    <>
                      <li className="flex items-start"><span className="mr-2">✓</span> Access to community events</li>
                      <li className="flex items-start"><span className="mr-2">✓</span> Monthly newsletters</li>
                    </>
                  )}
                  {tier === 'Silver' && (
                    <>
                      <li className="flex items-start"><span className="mr-2">✓</span> All Free benefits</li>
                      <li className="flex items-start"><span className="mr-2">✓</span> Exclusive workshops</li>
                      <li className="flex items-start"><span className="mr-2">✓</span> Priority support</li>
                    </>
                  )}
                  {tier === 'Gold' && (
                    <>
                      <li className="flex items-start"><span className="mr-2">✓</span> All Silver benefits</li>
                      <li className="flex items-start"><span className="mr-2">✓</span> Masterclass access</li>
                      <li className="flex items-start"><span className="mr-2">✓</span> Networking events</li>
                    </>
                  )}
                  {tier === 'Platinum' && (
                    <>
                      <li className="flex items-start"><span className="mr-2">✓</span> All Gold benefits</li>
                      <li className="flex items-start"><span className="mr-2">✓</span> VIP events</li>
                      <li className="flex items-start"><span className="mr-2">✓</span> Personal concierge</li>
                    </>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2023 Membership Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}