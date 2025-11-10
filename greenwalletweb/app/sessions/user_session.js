// sessions/user_session.js
import { supabase } from '../../lib/superbase'

class UserSession {
  constructor() {
    this.user = null;
    this.institution = null;
    this.isLoading = true;
    this.listeners = new Set();
  }

  // Subscribe to session changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(callback => callback({
      user: this.user,
      institution: this.institution,
      isLoading: this.isLoading
    }));
  }

  // Initialize session - call this on app start
  async initialize() {
    try {
      this.isLoading = true;
      this.notify();

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        await this.setUser(session.user);
      } else {
        this.user = null;
        this.institution = null;
      }
    } catch (error) {
      console.error('Session initialization error:', error);
      this.user = null;
      this.institution = null;
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  // Set user data and fetch institution info
  async setUser(user) {
    try {
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
        console.error('Error fetching institution data:', error);
        this.institution = null;
      } else {
        this.institution = institution;
      }
    } catch (error) {
      console.error('Error setting user:', error);
      this.institution = null;
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  // Clear session (logout)
  clear() {
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

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event);
  
  if (event === 'SIGNED_IN' && session?.user) {
    await userSession.setUser(session.user);
  } else if (event === 'SIGNED_OUT') {
    userSession.clear();
  } else if (event === 'USER_UPDATED' && session?.user) {
    await userSession.setUser(session.user);
  }
});

export default userSession;