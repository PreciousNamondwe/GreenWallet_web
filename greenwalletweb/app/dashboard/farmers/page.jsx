'use client';
import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Download, Globe
} from 'lucide-react';
import userSession from '../../sessions/user_session';
import AddFarmerModal from '../../../components/AddFarmerModal';
import WebFormModal from '../../../components/WebFormModal';
import { supabase } from '../../../lib/superbase'; 

export default function FarmersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFarmerModal, setShowAddFarmerModal] = useState(false);
  const [showWebFormModal, setShowWebFormModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addFarmerStep, setAddFarmerStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [webForms, setWebForms] = useState([]);
  
  const [newFarmer, setNewFarmer] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    
    // Step 2: Farm Information
    location: '',
    farmSize: '',
    cropType: '',
    farmingExperience: '',
    landOwnership: '',
    soilType: '',
    
    // Step 3: Financial Information
    monthlyIncome: '',
    bankName: '',
    accountNumber: '',
    emergencyContact: '',
    hasPreviousLoan: '',
    
    // Step 4: Documents & Verification
    idDocument: null,
    landDocument: null,
    photo: null,
    termsAccepted: false
  });

  const farmers = [
    { id: 1, name: 'Majidu Inusa', phone: '+2348012345678', location: 'Lilongwe, 23', status: 'Active', loans: 2 },
    { id: 2, name: 'Precious Namondwe', phone: '+2348023456789', location: 'Lilongwe 46', status: 'Active', loans: 1 },
    { id: 3, name: 'Fatima Hussen', phone: '+2348034567890', location: 'Blantyre, zingwangwa', status: 'Pending', loans: 0 },
    { id: 4, name: 'Clement Frank', phone: '+2348045678901', location: 'lilongwe, 36', status: 'Active', loans: 1 },
  ];

  // Fetch company name and institution ID from user session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        
        if (!userSession.initialized) {
          await userSession.initialize();
        }

        const unsubscribe = userSession.subscribe((session) => {
          console.log('🔄 FarmersPage: Session updated', session);
          
          if (session.institution) {
            setCompanyName(session.institution.institution_name);
            setInstitutionId(session.institution.id);
            console.log('🏢 FarmersPage: Institution set:', session.institution.institution_name, session.institution.id);
            loadWebForms(session.institution.id);
          } else if (session.user) {
            const displayName = userSession.getDisplayName();
            setCompanyName(displayName);
            setInstitutionId(session.user.id);
            console.log('👤 FarmersPage: Using user data as fallback');
          } else {
            setCompanyName('AgriFin');
            console.log('⚠️ FarmersPage: Using default company name');
          }
          
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('❌ FarmersPage: Error initializing session:', error);
        setCompanyName('AgriFin');
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Load existing web forms for this institution from Supabase
  const loadWebForms = async (institutionId) => {
    try {
      const { data, error } = await supabase
        .from('web_forms')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedForms = data.map(form => ({
          id: form.id,
          institutionId: form.institution_id,
          companyName: form.company_name,
          createdAt: form.created_at,
          url: form.form_url,
          isActive: form.is_active,
          submissions: form.submissions_count
        }));
        setWebForms(formattedForms);
      }
    } catch (error) {
      console.error('Error loading web forms from Supabase:', error);
      showToast('Error loading web forms', 'error');
    }
  };

  // Generate a unique UUID for the web form
  const generateUUID = () => {
    return crypto.randomUUID(); // Use browser's crypto API
  };

  // Create a new web form with UUID and store in Supabase
  const createWebForm = async () => {
    try {
      const formId = generateUUID();
      // Use query parameter instead of dynamic route
      const formUrl = `${window.location.origin}/public/loan_application?form=${formId}`;
      
      const { data, error } = await supabase
        .from('web_forms')
        .insert({
          id: formId,
          institution_id: institutionId,
          company_name: companyName,
          form_url: formUrl,
          is_active: true,
          submissions_count: 0
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newForm = {
          id: data.id,
          institutionId: data.institution_id,
          companyName: data.company_name,
          createdAt: data.created_at,
          url: data.form_url,
          isActive: data.is_active,
          submissions: data.submissions_count
        };

        setWebForms(prev => [newForm, ...prev]);
        return newForm;
      }
    } catch (error) {
      console.error('Error creating web form:', error);
      showToast('Error creating web form', 'error');
      return null;
    }
  };

  const generateWebFormLink = async () => {
    let webForm;
    
    // Check for existing active forms
    const activeForm = webForms.find(form => form.isActive);
    if (activeForm) {
      webForm = activeForm;
    } else {
      // Create a new form
      webForm = await createWebForm();
      if (!webForm) return;
    }
    
    navigator.clipboard.writeText(webForm.url);
    setCopiedLink(true);
    showToast('Form link copied to clipboard!', 'success');
    
    setTimeout(() => setCopiedLink(false), 2000);
    return webForm.url;
  };

  const createNewWebForm = async () => {
    const webForm = await createWebForm();
    if (webForm) {
      navigator.clipboard.writeText(webForm.url);
      setCopiedLink(true);
      showToast('New form created and link copied!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
    return webForm?.url;
  };

  const shareWebForm = async () => {
    const webFormLink = await generateWebFormLink();
    if (!webFormLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${companyName} Loan Application`,
          text: `Apply for an agricultural loan with ${companyName}`,
          url: webFormLink,
        });
        showToast('Form shared successfully!', 'success');
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      const message = `Apply for an agricultural loan with ${companyName}! Use our online form: ${webFormLink}`;
      navigator.clipboard.writeText(message);
      showToast('Share message copied to clipboard!', 'success');
    }
  };

  const toggleFormStatus = async (formId) => {
    try {
      const currentForm = webForms.find(form => form.id === formId);
      const newStatus = !currentForm?.isActive;

      const { error } = await supabase
        .from('web_forms')
        .update({ is_active: newStatus })
        .eq('id', formId);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedForms = webForms.map(form => 
        form.id === formId ? { ...form, isActive: newStatus } : form
      );
      setWebForms(updatedForms);
      
      showToast(`Form ${newStatus ? 'activated' : 'deactivated'}!`, 'success');
    } catch (error) {
      console.error('Error toggling form status:', error);
      showToast('Error updating form status', 'error');
    }
  };

  const deleteForm = async (formId) => {
    try {
      const { error } = await supabase
        .from('web_forms')
        .delete()
        .eq('id', formId);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedForms = webForms.filter(form => form.id !== formId);
      setWebForms(updatedForms);
      
      showToast('Form deleted!', 'success');
    } catch (error) {
      console.error('Error deleting form:', error);
      showToast('Error deleting form', 'error');
    }
  };

  const handleAddFarmer = (e) => {
    e.preventDefault();
    console.log('Adding new farmer:', newFarmer);
    
    // Reset form and close modal
    setNewFarmer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idNumber: '',
      dateOfBirth: '',
      gender: '',
      location: '',
      farmSize: '',
      cropType: '',
      farmingExperience: '',
      landOwnership: '',
      soilType: '',
      monthlyIncome: '',
      bankName: '',
      accountNumber: '',
      emergencyContact: '',
      hasPreviousLoan: '',
      idDocument: null,
      landDocument: null,
      photo: null,
      termsAccepted: false
    });
    setAddFarmerStep(1);
    setShowAddFarmerModal(false);
    
    showToast('Farmer added successfully!', 'success');
  };

  const nextStep = () => {
    setAddFarmerStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setAddFarmerStep(prev => Math.max(prev - 1, 1));
  };

  const showToast = (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setNewFarmer(prev => ({ ...prev, [name]: checked }));
    } else if (files) {
      setNewFarmer(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setNewFarmer(prev => ({ ...prev, [name]: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading company information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Modal Components */}
      <AddFarmerModal
        showAddFarmerModal={showAddFarmerModal}
        setShowAddFarmerModal={setShowAddFarmerModal}
        addFarmerStep={addFarmerStep}
        setAddFarmerStep={setAddFarmerStep}
        newFarmer={newFarmer}
        setNewFarmer={setNewFarmer}
        handleAddFarmer={handleAddFarmer}
        nextStep={nextStep}
        prevStep={prevStep}
        handleInputChange={handleInputChange}
        showToast={showToast}
      />

      <WebFormModal
        showWebFormModal={showWebFormModal}
        setShowWebFormModal={setShowWebFormModal}
        companyName={companyName}
        copiedLink={copiedLink}
        webForms={webForms}
        generateWebFormLink={generateWebFormLink}
        createNewWebForm={createNewWebForm}
        shareWebForm={shareWebForm}
        toggleFormStatus={toggleFormStatus}
        deleteForm={deleteForm}
        showToast={showToast}
      />

      {/* Main Content */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Farmers Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage farmers and loan applications
              {companyName && (
                <span className="text-primary font-medium ml-2">• {companyName}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowAddFarmerModal(true)}
            className="flex items-center justify-center space-x-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl text-base font-semibold"
          >
            <Plus className="h-5 w-5" />
            <span>Add Farmer Manually</span>
          </button>
          
          <button 
            onClick={() => setShowWebFormModal(true)}
            className="flex items-center justify-center space-x-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl text-base font-semibold"
          >
            <Globe className="h-5 w-5" />
            <span>Create Web Form</span>
          </button>
        </div>
        
        <button className="flex items-center justify-center space-x-3 px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-all duration-200 text-base font-semibold hover:shadow-lg sm:w-auto w-full">
          <Download className="h-5 w-5" />
          <span>Export Farmers</span>
        </button>
      </div>

      {/* Farmers Table */}
      <div className="bg-background border border-border rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground text-base"
              />
            </div>
            <button className="flex items-center space-x-3 px-4 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-all duration-200 text-base font-semibold">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground text-base">Farmer</th>
                <th className="text-left p-4 font-semibold text-foreground text-base">Contact</th>
                <th className="text-left p-4 font-semibold text-foreground text-base">Location</th>
                <th className="text-left p-4 font-semibold text-foreground text-base">Status</th>
                <th className="text-left p-4 font-semibold text-foreground text-base">Active Loans</th>
                <th className="text-left p-4 font-semibold text-foreground text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer) => (
                <tr key={farmer.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-foreground text-base">{farmer.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground text-base">{farmer.phone}</td>
                  <td className="p-4 text-muted-foreground text-base">{farmer.location}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      farmer.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {farmer.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-base">{farmer.loans}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-border text-foreground rounded text-sm font-medium hover:bg-muted transition-colors">
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}