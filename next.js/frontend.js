import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  tier: 'Free' | 'Silver' | 'Gold' | 'Platinum';
}

interface User {
  id: number;
  name: string;
  email: string;
  tier: 'Free' | 'Silver' | 'Gold' | 'Platinum';
}

const TIER_HIERARCHY = ['Free', 'Silver', 'Gold', 'Platinum'] as const;

export default function EventsPage() {
  const [userTier, setUserTier] = useState<'Free' | 'Silver' | 'Gold' | 'Platinum'>('Free');
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', tier: 'Free' as 'Free' | 'Silver' | 'Gold' | 'Platinum' });

  // Fetch events and users from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [eventsRes, usersRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/users')
        ]);
        
        if (!eventsRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const eventsData = await eventsRes.json();
        const usersData = await usersRes.json();
        
        setEvents(eventsData);
        setUsers(usersData);
        
        // Select first user by default
        if (usersData.length > 0) {
          setSelectedUser(usersData[0].id);
          setUserTier(usersData[0].tier);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter events based on user tier
  useEffect(() => {
    const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
    const accessibleEvents = events.filter(event => 
      TIER_HIERARCHY.indexOf(event.tier) <= userTierIndex
    );
    setFilteredEvents(accessibleEvents);
  }, [userTier, events]);

  // Handle user selection change
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(e.target.value);
    setSelectedUser(userId);
    
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserTier(user.tier);
    }
  };

  // Handle tier change for selected user
  const handleTierChange = async (tier: 'Free' | 'Silver' | 'Gold' | 'Platinum') => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser}/tier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user tier');
      }
      
      const updatedUser = await response.json();
      
      // Update users list
      setUsers(users.map(u => u.id === selectedUser ? updatedUser : u));
      setUserTier(tier);
    } catch (err) {
      console.error('Error updating user tier:', err);
      alert('Failed to update user tier');
    }
  };

  // Handle new user creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const createdUser = await response.json();
      
      // Update users list
      setUsers([...users, createdUser]);
      setSelectedUser(createdUser.id);
      setUserTier(createdUser.tier);
      
      // Reset form
      setNewUser({ name: '', email: '', tier: 'Free' });
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user');
    }
  };

  const tierClasses = {
    Free: 'tier-free',
    Silver: 'tier-silver',
    Gold: 'tier-gold',
    Platinum: 'tier-platinum'
  };

  const tierIcons = {
    Free: '🆓',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎'
  };

  return (
    <div>
      <Head>
        <title>Tier-Based Event Filter</title>
        <meta name="description" content="Filter events by membership tier" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container py-8">
        <div className="text-center mb-10">
          <h1 className="text-gray-800">Membership Events</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover events available for your membership tier. Higher tiers unlock more exclusive experiences.
          </p>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-gray-800 mb-4">User Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUser || ''}
                onChange={handleUserChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.tier})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Create New User */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
                <select
                  value={newUser.tier}
                  onChange={(e) => setNewUser({...newUser, tier: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Free">Free</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Tier Selector */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-gray-800 mb-4">Your Membership Tier</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {TIER_HIERARCHY.map(tier => (
              <button
                key={tier}
                onClick={() => handleTierChange(tier)}
                className={`btn-tier ${userTier === tier ? tierClasses[tier] + ' active' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span className="text-lg mr-2">{tierIcons[tier]}</span>
                {tier}
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Current tier: <span className={`font-semibold px-2 py-1 rounded ${tierClasses[userTier]}`}>
                {tierIcons[userTier]} {userTier}
              </span>
            </p>
          </div>
        </div>

        {/* Events List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-gray-800">Available Events</h2>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl text-gray-800 mb-2">Error Loading Events</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl text-gray-800 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                Upgrade your membership to access more exclusive events!
              </p>
              <button 
                onClick={() => handleTierChange('Silver')}
                className="btn btn-primary"
              >
                Upgrade to Silver
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-card-content">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-gray-800">{event.title}</h3>
                      <span className={`badge ${tierClasses[event.tier]}`}>
                        {tierIcons[event.tier]} {event.tier}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {event.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="event-card-footer">
                    <button className="btn btn-primary">
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
          <h2 className="text-gray-800 mb-6 text-center">Membership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIER_HIERARCHY.map(tier => (
              <div key={tier} className={`benefits-card ${userTier === tier ? 'active' : ''}`}>
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">{tierIcons[tier]}</span>
                  <h3 className="text-lg">{tier} Tier</h3>
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

      <footer className="footer">
        <div className="container text-center text-gray-600">
          <p>© 2023 Membership Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}