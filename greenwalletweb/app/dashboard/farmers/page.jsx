'use client';
import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Download, X, Mail, Phone, 
  MapPin, User, Globe, Clipboard, Share2, CheckCircle,
  Building, Crop, Ruler, IdCard, ArrowRight, ArrowLeft,
  Calendar, Shield, Banknote, FileText, Link
} from 'lucide-react';
import userSession from '../../sessions/user_session'; // Adjust path as needed

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
        
        // Initialize the session if not already done
        if (!userSession.initialized) {
          await userSession.initialize();
        }

        // Subscribe to session changes
        const unsubscribe = userSession.subscribe((session) => {
          console.log('🔄 FarmersPage: Session updated', session);
          
          if (session.institution) {
            setCompanyName(session.institution.institution_name);
            setInstitutionId(session.institution.id);
            console.log('🏢 FarmersPage: Institution set:', session.institution.institution_name, session.institution.id);
            
            // Load existing web forms for this institution
            loadWebForms(session.institution.id);
          } else if (session.user) {
            // Fallback to user metadata or email if institution name not available
            const displayName = userSession.getDisplayName();
            setCompanyName(displayName);
            setInstitutionId(session.user.id);
            console.log('👤 FarmersPage: Using user data as fallback');
          } else {
            setCompanyName('AgriFin'); // Default fallback
            console.log('⚠️ FarmersPage: Using default company name');
          }
          
          setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error('❌ FarmersPage: Error initializing session:', error);
        setCompanyName('AgriFin');
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Load existing web forms for this institution
  const loadWebForms = async (institutionId) => {
    try {
      // In a real app, you would fetch from your database
      // For now, we'll use localStorage as a demo
      const storedForms = localStorage.getItem(`web_forms_${institutionId}`);
      if (storedForms) {
        setWebForms(JSON.parse(storedForms));
      }
    } catch (error) {
      console.error('Error loading web forms:', error);
    }
  };

  // Generate a unique UUID for the web form
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Create a new web form with UUID
  const createWebForm = () => {
    const formId = generateUUID();
    const formData = {
      id: formId,
      institutionId: institutionId,
      companyName: companyName,
      createdAt: new Date().toISOString(),
      url: `${window.location.origin}/public/loan_application/${formId}`,
      isActive: true,
      submissions: 0
    };

    // Save to web forms list
    const updatedForms = [...webForms, formData];
    setWebForms(updatedForms);
    
    // Save to localStorage (in real app, save to database)
    localStorage.setItem(`web_forms_${institutionId}`, JSON.stringify(updatedForms));

    return formData;
  };

  const generateWebFormLink = () => {
    // Create new web form or use existing one
    let webForm;
    if (webForms.length > 0) {
      // Use the most recent active form
      webForm = webForms.find(form => form.isActive) || webForms[0];
    } else {
      // Create a new form
      webForm = createWebForm();
    }
    
    navigator.clipboard.writeText(webForm.url);
    setCopiedLink(true);
    showToast('Form link copied to clipboard!', 'success');
    
    setTimeout(() => setCopiedLink(false), 2000);
    return webForm.url;
  };

  const createNewWebForm = () => {
    const webForm = createWebForm();
    navigator.clipboard.writeText(webForm.url);
    setCopiedLink(true);
    showToast('New form created and link copied!', 'success');
    
    setTimeout(() => setCopiedLink(false), 2000);
    return webForm.url;
  };

  const shareWebForm = async () => {
    const webFormLink = generateWebFormLink();
    
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

  const toggleFormStatus = (formId) => {
    const updatedForms = webForms.map(form => 
      form.id === formId ? { ...form, isActive: !form.isActive } : form
    );
    setWebForms(updatedForms);
    localStorage.setItem(`web_forms_${institutionId}`, JSON.stringify(updatedForms));
    showToast(`Form ${webForms.find(f => f.id === formId)?.isActive ? 'deactivated' : 'activated'}!`, 'success');
  };

  const deleteForm = (formId) => {
    const updatedForms = webForms.filter(form => form.id !== formId);
    setWebForms(updatedForms);
    localStorage.setItem(`web_forms_${institutionId}`, JSON.stringify(updatedForms));
    showToast('Form deleted!', 'success');
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
    // Validate current step before proceeding
    if (validateStep(addFarmerStep)) {
      setAddFarmerStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setAddFarmerStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!newFarmer.firstName || !newFarmer.lastName || !newFarmer.phone || !newFarmer.idNumber) {
          showToast('Please fill all required fields in Personal Information', 'error');
          return false;
        }
        break;
      case 2:
        if (!newFarmer.location || !newFarmer.farmSize || !newFarmer.cropType) {
          showToast('Please fill all required fields in Farm Information', 'error');
          return false;
        }
        break;
      case 3:
        if (!newFarmer.monthlyIncome || !newFarmer.emergencyContact) {
          showToast('Please fill all required fields in Financial Information', 'error');
          return false;
        }
        break;
      case 4:
        if (!newFarmer.termsAccepted) {
          showToast('Please accept the terms and conditions', 'error');
          return false;
        }
        break;
    }
    return true;
  };

  const showToast = (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // In a real app, you'd use a proper toast notification
    alert(message); // Temporary for demo
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

  // Show loading state while fetching company name
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
      {/* Enhanced Add Farmer Modal with 4 Steps */}
      {showAddFarmerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-border animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Add New Farmer</h2>
                  <p className="text-primary text-sm">
                    {addFarmerStep === 1 && 'Personal Information'}
                    {addFarmerStep === 2 && 'Farm Details'}
                    {addFarmerStep === 3 && 'Financial Information'}
                    {addFarmerStep === 4 && 'Documents & Verification'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddFarmerModal(false);
                  setAddFarmerStep(1);
                }}
                className="p-2 hover:bg-muted rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === addFarmerStep
                        ? 'bg-primary text-primary-foreground'
                        : step < addFarmerStep
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-12 h-1 mx-2 ${
                        step < addFarmerStep ? 'bg-green-500' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleAddFarmer} className="p-6 space-y-6 overflow-y-auto max-h-[50vh]">
              {/* Step 1: Personal Information */}
              {addFarmerStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <User className="h-4 w-4 text-primary" />
                        <span>First Name *</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={newFarmer.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <span>Last Name *</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={newFarmer.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newFarmer.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>Phone Number *</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={newFarmer.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="+265 XXX XXX XXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <IdCard className="h-4 w-4 text-primary" />
                        <span>ID Number *</span>
                      </label>
                      <input
                        type="text"
                        name="idNumber"
                        required
                        value={newFarmer.idNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="National ID number"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Date of Birth</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={newFarmer.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                      <span>Gender</span>
                    </label>
                    <select
                      name="gender"
                      value={newFarmer.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Farm Information */}
              {addFarmerStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Farm Information</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Farm Location *</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={newFarmer.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                      placeholder="Enter farm location/village"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <Ruler className="h-4 w-4 text-primary" />
                        <span>Farm Size (acres) *</span>
                      </label>
                      <input
                        type="number"
                        name="farmSize"
                        required
                        value={newFarmer.farmSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="e.g., 5"
                        min="0.1"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <Crop className="h-4 w-4 text-primary" />
                        <span>Main Crop *</span>
                      </label>
                      <select
                        name="cropType"
                        required
                        value={newFarmer.cropType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground"
                      >
                        <option value="">Select Main Crop</option>
                        <option value="maize">Maize</option>
                        <option value="rice">Rice</option>
                        <option value="soybeans">Soybeans</option>
                        <option value="groundnuts">Groundnuts</option>
                        <option value="tobacco">Tobacco</option>
                        <option value="cotton">Cotton</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <span>Farming Experience (years)</span>
                      </label>
                      <input
                        type="number"
                        name="farmingExperience"
                        value={newFarmer.farmingExperience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="e.g., 5"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <span>Land Ownership</span>
                      </label>
                      <select
                        name="landOwnership"
                        value={newFarmer.landOwnership}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground"
                      >
                        <option value="">Select Ownership</option>
                        <option value="owned">Owned</option>
                        <option value="rented">Rented</option>
                        <option value="family">Family Land</option>
                        <option value="communal">Communal Land</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <span>Soil Type</span>
                      </label>
                      <select
                        name="soilType"
                        value={newFarmer.soilType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground"
                      >
                        <option value="">Select Soil Type</option>
                        <option value="clay">Clay</option>
                        <option value="sandy">Sandy</option>
                        <option value="loamy">Loamy</option>
                        <option value="silt">Silt</option>
                        <option value="peat">Peat</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Financial Information */}
              {addFarmerStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Financial Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <Banknote className="h-4 w-4 text-primary" />
                        <span>Monthly Income (MWK) *</span>
                      </label>
                      <input
                        type="number"
                        name="monthlyIncome"
                        required
                        value={newFarmer.monthlyIncome}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="Enter monthly income"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <span>Bank Name</span>
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={newFarmer.bankName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="Bank name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <span>Account Number</span>
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={newFarmer.accountNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="Bank account number"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>Emergency Contact *</span>
                      </label>
                      <input
                        type="tel"
                        name="emergencyContact"
                        required
                        value={newFarmer.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground shadow-sm"
                        placeholder="Emergency phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <span>Previous Loan Experience</span>
                      </label>
                      <select
                        name="hasPreviousLoan"
                        value={newFarmer.hasPreviousLoan}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground"
                      >
                        <option value="">Select Option</option>
                        <option value="yes">Yes, has previous loan</option>
                        <option value="no">No, first time borrower</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents & Verification */}
              {addFarmerStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Documents & Verification</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>ID Document</span>
                      </label>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-all duration-200 bg-input">
                        <input
                          type="file"
                          name="idDocument"
                          onChange={handleInputChange}
                          accept="image/*,.pdf"
                          className="hidden"
                          id="idDocument"
                        />
                        <label
                          htmlFor="idDocument"
                          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          Upload ID Document
                        </label>
                        {newFarmer.idDocument && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {newFarmer.idDocument.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Land Ownership Proof</span>
                      </label>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-all duration-200 bg-input">
                        <input
                          type="file"
                          name="landDocument"
                          onChange={handleInputChange}
                          accept="image/*,.pdf"
                          className="hidden"
                          id="landDocument"
                        />
                        <label
                          htmlFor="landDocument"
                          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          Upload Land Document
                        </label>
                        {newFarmer.landDocument && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {newFarmer.landDocument.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Farmer Photograph</span>
                      </label>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-all duration-200 bg-input">
                        <input
                          type="file"
                          name="photo"
                          onChange={handleInputChange}
                          accept="image/*"
                          className="hidden"
                          id="photo"
                        />
                        <label
                          htmlFor="photo"
                          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          Upload Photo
                        </label>
                        {newFarmer.photo && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {newFarmer.photo.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 text-sm font-semibold text-foreground">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        required
                        checked={newFarmer.termsAccepted}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <Shield className="h-4 w-4 text-primary" />
                      <span>I confirm that all information provided is accurate and complete *</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-border">
                {addFarmerStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-6 py-3.5 border border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-semibold hover:shadow-lg"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFarmerModal(false);
                      setAddFarmerStep(1);
                    }}
                    className="flex items-center space-x-2 px-6 py-3.5 border border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-semibold hover:shadow-lg"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                )}

                {addFarmerStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <User className="h-4 w-4" />
                    <span>Add Farmer</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Web Form Modal */}
      {showWebFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-background rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-border animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Web Form Management</h2>
                  <p className="text-primary text-sm">Create and manage loan application forms</p>
                  {companyName && (
                    <p className="text-green-600 text-xs font-medium mt-1">
                      For: {companyName}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowWebFormModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={generateWebFormLink}
                  className="p-5 bg-background border-2 border-border rounded-2xl hover:border-primary hover:shadow-xl transition-all duration-300 group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {copiedLink ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <Clipboard className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                          {copiedLink ? 'Link Copied!' : 'Copy Form Link'}
                        </h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Copy existing form URL to share
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={createNewWebForm}
                  className="p-5 bg-background border-2 border-border rounded-2xl hover:border-green-500 hover:shadow-xl transition-all duration-300 group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg group-hover:text-green-600 transition-colors">
                          Create New Form
                        </h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Generate a new unique form URL
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Existing Forms List */}
              {webForms.length > 0 && (
                <div className="bg-muted rounded-2xl p-5 border border-border">
                  <h4 className="font-semibold text-foreground text-lg mb-4 flex items-center space-x-2">
                    <Link className="h-5 w-5 text-primary" />
                    <span>Your Forms ({webForms.length})</span>
                  </h4>
                  <div className="space-y-3">
                    {webForms.map((form, index) => (
                      <div key={form.id} className="bg-background rounded-xl p-4 border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`w-3 h-3 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="font-medium text-foreground">
                                Form {index + 1} {!form.isActive && '(Inactive)'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Created: {new Date(form.createdAt).toLocaleDateString()}
                              </span>
                              {form.submissions > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {form.submissions} submissions
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs break-all flex-1">
                                {form.url}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(form.url);
                                  showToast('Form link copied!', 'success');
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <Clipboard className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleFormStatus(form.id)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                form.isActive 
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {form.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteForm(form.id)}
                              className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                <h4 className="font-semibold text-foreground text-lg mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Form Features</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Unique URL for each microfinance',
                    'Multi-step application process',
                    'Document upload capability',
                    'Mobile responsive design',
                    'Auto-profile creation',
                    'Real-time validation',
                    'Secure data encryption',
                    'Submission tracking'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex space-x-4 p-6 border-t border-border bg-muted/30">
              <button
                onClick={() => setShowWebFormModal(false)}
                className="flex-1 px-6 py-3.5 border border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-semibold hover:shadow-lg"
              >
                Close
              </button>
              <button
                onClick={generateWebFormLink}
                className="flex-1 px-6 py-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Clipboard className="h-4 w-4" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

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