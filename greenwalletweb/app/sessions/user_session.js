// sessions/user_session.js
import { supabase } from '../../lib/superbase';

class UserSession {
  constructor() {
    this.user = null;
    this.institution = null;
    this.isLoading = true;
    this.listeners = new Set();
    this.initialized = false;
  }

  // Subscribe to session changes
  subscribe(callback) {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.getCurrentUser());
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notify() {
    const currentState = this.getCurrentUser();
    this.listeners.forEach(callback => callback(currentState));
  }

  // Initialize session - call this on app start
  async initialize() {
    if (this.initialized) return;
    
    console.log('🔄 Session: Initializing session...');
    this.isLoading = true;
    this.initialized = true;
    this.notify();

    try {
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session: Initialization error:', error);
        throw error;
      }

      console.log('🔍 Session: Session found:', !!session);
      console.log('👤 Session: User email:', session?.user?.email);
      
      if (session?.user) {
        console.log('✅ Session: Setting user from existing session');
        await this.setUser(session.user);
      } else {
        console.log('❌ Session: No session found');
        this.user = null;
        this.institution = null;
        this.isLoading = false;
        this.notify();
      }
    } catch (error) {
      console.error('❌ Session: Initialization failed:', error);
      this.user = null;
      this.institution = null;
      this.isLoading = false;
      this.notify();
    }
  }

  // Set user data and fetch institution info
  async setUser(user) {
    try {
      console.log('👤 Session: Setting user:', user?.email);
      this.user = user;
      this.isLoading = true;
      this.notify();

      // Fetch institution data from database
      const { data: institution, error } = await supabase
        .from('microfinance_institutions')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Session: Error fetching institution:', error);
        this.institution = null;
      } else {
        console.log('🏢 Session: Institution data found:', institution?.institution_name);
        this.institution = institution;
      }
    } catch (error) {
      console.error('❌ Session: Error setting user:', error);
      this.institution = null;
    } finally {
      this.isLoading = false;
      this.notify();
      console.log('✅ Session: User setup complete');
    }
  }

  // Clear session (logout)
  clear() {
    console.log('🚪 Session: Clearing session');
    this.user = null;
    this.institution = null;
    this.isLoading = false;
    this.notify();
  }

  // Get current user data
  getCurrentUser() {
    return {
      user: this.user,
      institution: this.institution,
      isLoading: this.isLoading
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.user && !!this.institution;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.user_metadata?.user_type === role;
  }

  // Check if KYC is approved
  isKYCApproved() {
    return this.institution?.kyc_status === 'approved';
  }

  // Get user display name
  getDisplayName() {
    if (this.user?.user_metadata?.display_name) {
      return this.user.user_metadata.display_name;
    }
    if (this.institution?.institution_name) {
      return this.institution.institution_name;
    }
    return this.user?.email || 'User';
  }

  // Get contact person name
  getContactPerson() {
    return this.user?.user_metadata?.full_name || 
           this.institution?.contact_person || 
           'Administrator';
  }

  // Get user initials for avatar
  getUserInitials() {
    const contactPerson = this.getContactPerson();
    return contactPerson
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

// Create singleton instance
const userSession = new UserSession();

// Set up auth state listener - this persists across page refreshes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 Auth: State changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN' && session?.user) {
    console.log('✅ Auth: User signed in, updating session');
    await userSession.setUser(session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('🚪 Auth: User signed out, clearing session');
    userSession.clear();
  } else if (event === 'USER_UPDATED' && session?.user) {
    console.log('📝 Auth: User updated, refreshing session');
    await userSession.setUser(session.user);
  } else if (event === 'INITIAL_SESSION') {
    console.log('🔍 Auth: Initial session event - checking for existing session');
    // This fires on page load, check if we have a session
    if (session?.user) {
      console.log('✅ Auth: Initial session has user, setting up');
      await userSession.setUser(session.user);
    } else {
      console.log('❌ Auth: No initial session found');
      userSession.isLoading = false;
      userSession.notify();
    }
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Auth: Token refreshed');
  }
});

export default userSession;