'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Phone, MapPin, Mail, DollarSign, Calendar, Upload, CheckCircle, Building } from 'lucide-react';
import { supabase } from '../../../lib/superbase'; // Fixed the import path

export default function ApplyLoanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formId = searchParams.get('form');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [institutionData, setInstitutionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    
    // Farm Information
    farmLocation: '',
    farmSize: '',
    mainCrop: '',
    farmingExperience: '',
    landOwnership: '',
    
    // Loan Details
    loanAmount: '',
    loanPurpose: '',
    repaymentPeriod: '',
    collateral: '',
    
    // Documents
    idDocument: null,
    landDocument: null,
    photo: null
  });

  const [submitted, setSubmitted] = useState(false);

  // Enhanced function to fetch institution data
  useEffect(() => {
    const fetchInstitutionData = async () => {
      try {
        setIsLoading(true);
        setFormError('');
        
        console.log('🔍 Checking form ID:', formId);
        
        if (!formId) {
          setFormError('Invalid form link. Missing form parameter.');
          setIsLoading(false);
          return;
        }

        // First, check if the form exists and is active
        const { data: webForm, error: formError } = await supabase
          .from('web_forms')
          .select(`
            *,
            microfinance_institutions (
              institution_name,
              phone,
              email,
              address
            )
          `)
          .eq('id', formId)
          .eq('is_active', true)
          .single();

        if (formError || !webForm) {
          console.error('Form fetch error:', formError);
          throw new Error('Form not found or inactive. Please check your link.');
        }

        console.log('✅ Form found:', webForm);

        // Check if institution data exists
        if (!webForm.microfinance_institutions) {
          throw new Error('Institution information not found.');
        }

        const institution = webForm.microfinance_institutions;

        setInstitutionData({
          name: institution.institution_name,
          contact: institution.contact_info,
          email: institution.email,
          address: institution.address,
          formId: webForm.id,
          institutionId: webForm.institution_id,
          companyName: webForm.company_name
        });

      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setFormError(error.message || 'Invalid form link. Please check your URL.');
      } finally {
        setIsLoading(false);
      }
    };

    if (formId) {
      fetchInstitutionData();
    }
  }, [formId]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!institutionData) {
    setFormError('Cannot identify lending institution. Please use a valid form link.');
    return;
  }

  try {
    console.log('📝 Submitting application for form:', formId);

    // Enhanced validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.idNumber || !formData.dateOfBirth || !formData.gender) {
      throw new Error('Please fill all required personal information fields');
    }

    if (!formData.farmLocation || !formData.farmSize || !formData.mainCrop || !formData.farmingExperience || !formData.landOwnership) {
      throw new Error('Please fill all required farm information fields');
    }

    if (!formData.loanAmount || !formData.loanPurpose || !formData.repaymentPeriod) {
      throw new Error('Please fill all required loan details fields');
    }

    if (!formData.idDocument) {
      throw new Error('Please upload your National ID document');
    }

    // Upload documents to existing 'documents' bucket in 'loan-docs' directory
    let idDocumentPath = null;
    let landDocumentPath = null;
    let photoPath = null;

    // Function to upload file to Supabase Storage
    const uploadFile = async (file, subfolder, fileName) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `loan-docs/${subfolder}/${formId}/${Date.now()}_${fileName}.${fileExt}`;

      console.log(`📤 Uploading ${fileName} to documents bucket...`);
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) {
        console.error(`Upload error for ${fileName}:`, error);
        throw new Error(`Failed to upload ${fileName}: ${error.message}`);
      }

      console.log(`✅ ${fileName} uploaded successfully:`, filePath);
      return filePath;
    };

    // Upload ID Document
    if (formData.idDocument) {
      console.log('📤 Uploading ID document...');
      idDocumentPath = await uploadFile(formData.idDocument, 'id-documents', 'national_id');
    }

    // Upload Land Document
    if (formData.landDocument) {
      console.log('📤 Uploading land document...');
      landDocumentPath = await uploadFile(formData.landDocument, 'land-documents', 'land_proof');
    }

    // Upload Photo
    if (formData.photo) {
      console.log('📤 Uploading photo...');
      photoPath = await uploadFile(formData.photo, 'photos', 'applicant_photo');
    }

    // Insert loan application into Supabase
    console.log('💾 Saving application to database...');
    const { data, error } = await supabase
      .from('loan_applications')
      .insert({
        web_form_id: formId,
        institution_id: institutionData.institutionId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        id_number: formData.idNumber,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        farm_location: formData.farmLocation,
        farm_size: formData.farmSize ? parseFloat(formData.farmSize) : null,
        main_crop: formData.mainCrop,
        farming_experience: formData.farmingExperience ? parseInt(formData.farmingExperience) : null,
        land_ownership: formData.landOwnership,
        loan_amount: formData.loanAmount ? parseFloat(formData.loanAmount) : null,
        loan_purpose: formData.loanPurpose,
        repayment_period: formData.repaymentPeriod,
        collateral: formData.collateral,
        id_document_path: idDocumentPath,
        land_document_path: landDocumentPath,
        photo_path: photoPath,
        status: 'submitted' // Changed to match your form submission
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      throw new Error('Failed to submit application. Please try again.');
    }

    console.log('✅ Application submitted:', data);

    // Update submission count using the database function
    const { error: updateError } = await supabase.rpc('increment_submission_count', { 
      form_id: formId 
    });

    if (updateError) {
      console.error('⚠️ Error updating submission count:', updateError);
      // Don't throw error here, just log it
    }

    console.log('✅ Submission count updated');
    setSubmitted(true);
    
  } catch (error) {
    console.error('❌ Error submitting application:', error);
    setFormError(error.message || 'Error submitting application. Please try again.');
  }
};
  const nextStep = () => {
    // Enhanced validation before proceeding to next step
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.idNumber || !formData.dateOfBirth || !formData.gender) {
        setFormError('Please fill all required fields in Personal Information');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.farmLocation || !formData.farmSize || !formData.mainCrop || !formData.farmingExperience || !formData.landOwnership) {
        setFormError('Please fill all required fields in Farm Information');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.loanAmount || !formData.loanPurpose || !formData.repaymentPeriod) {
        setFormError('Please fill all required fields in Loan Requirements');
        return;
      }
    }
    
    setFormError(''); // Clear any previous errors
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setFormError(''); // Clear errors when going back
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-foreground from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-primary-foreground rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Application Form</h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we load your form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (formError && !submitted) {
    return (
      <div className="min-h-screen bg-primary-foreground from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:primary-foreground rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Form Link</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{formError}</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left mb-6">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Check that the URL is correct</li>
              <li>• Ensure the form hasn't been deactivated</li>
              <li>• Contact the microfinance institution for a new link</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen primary-foreground from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Submitted!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for your loan application to <span className="font-semibold">{institutionData?.name}</span>.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We will review your information and contact you within 2-3 business days.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Application review by {institutionData?.name}</li>
              <li>• Verification of documents</li>
              <li>• Site visit if required</li>
              <li>• Loan approval decision</li>
              <li>• Funds disbursement if approved</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Show error message if exists
  const ErrorMessage = () => (
    formError && (
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center">
          <span className="text-red-500 mr-2">⚠</span>
          <p className="text-red-800 dark:text-red-200 text-sm">{formError}</p>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-primary-foreground from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-primary-foreground shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {institutionData?.name || 'Loading...'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Loan Application Form</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Form ID: {formId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ErrorMessage />
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === currentStep
                  ? 'bg-green-600 text-white'
                  : step < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-20 h-1 mx-2 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agricultural Loan Application</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Farm Details'}
            {currentStep === 3 && 'Loan Requirements'}
            {currentStep === 4 && 'Document Upload'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-primary-foreground rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="+265 XXX XXX XXX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    required
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="National ID number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white"
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">Select Gender</option>
                  <option value="male" className="text-gray-900 dark:text-white">Male</option>
                  <option value="female" className="text-gray-900 dark:text-white">Female</option>
                  <option value="other" className="text-gray-900 dark:text-white">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Farm Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Farm Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Farm Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="farmLocation"
                    required
                    value={formData.farmLocation}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter farm location/village"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Farm Size (acres) *
                  </label>
                  <input
                    type="number"
                    name="farmSize"
                    required
                    value={formData.farmSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="e.g., 5"
                    min="0.1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Main Crop *
                  </label>
                  <select
                    name="mainCrop"
                    required
                    value={formData.mainCrop}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white"
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">Select Main Crop</option>
                    <option value="maize" className="text-gray-900 dark:text-white">Maize</option>
                    <option value="rice" className="text-gray-900 dark:text-white">Rice</option>
                    <option value="soybeans" className="text-gray-900 dark:text-white">Soybeans</option>
                    <option value="groundnuts" className="text-gray-900 dark:text-white">Groundnuts</option>
                    <option value="tobacco" className="text-gray-900 dark:text-white">Tobacco</option>
                    <option value="cotton" className="text-gray-900 dark:text-white">Cotton</option>
                    <option value="other" className="text-gray-900 dark:text-white">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Farming Experience (years) *
                  </label>
                  <input
                    type="number"
                    name="farmingExperience"
                    required
                    value={formData.farmingExperience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="e.g., 5"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Land Ownership *
                  </label>
                  <select
                    name="landOwnership"
                    required
                    value={formData.landOwnership}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white"
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">Select Ownership</option>
                    <option value="owned" className="text-gray-900 dark:text-white">Owned</option>
                    <option value="rented" className="text-gray-900 dark:text-white">Rented</option>
                    <option value="family" className="text-gray-900 dark:text-white">Family Land</option>
                    <option value="communal" className="text-gray-900 dark:text-white">Communal Land</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Loan Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Loan Requirements</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Amount (MWK) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="number"
                    name="loanAmount"
                    required
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter amount in Malawian Kwacha"
                    min="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Purpose *
                </label>
                <select
                  name="loanPurpose"
                  required
                  value={formData.loanPurpose}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white"
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">Select Purpose</option>
                  <option value="seeds" className="text-gray-900 dark:text-white">Seeds & Inputs</option>
                  <option value="fertilizer" className="text-gray-900 dark:text-white">Fertilizers</option>
                  <option value="equipment" className="text-gray-900 dark:text-white">Farming Equipment</option>
                  <option value="irrigation" className="text-gray-900 dark:text-white">Irrigation System</option>
                  <option value="labor" className="text-gray-900 dark:text-white">Labor Costs</option>
                  <option value="storage" className="text-gray-900 dark:text-white">Storage Facilities</option>
                  <option value="other" className="text-gray-900 dark:text-white">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Repayment Period *
                  </label>
                  <select
                    name="repaymentPeriod"
                    required
                    value={formData.repaymentPeriod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white"
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">Select Period</option>
                    <option value="3" className="text-gray-900 dark:text-white">3 Months</option>
                    <option value="6" className="text-gray-900 dark:text-white">6 Months</option>
                    <option value="12" className="text-gray-900 dark:text-white">12 Months</option>
                    <option value="18" className="text-gray-900 dark:text-white">18 Months</option>
                    <option value="24" className="text-gray-900 dark:text-white">24 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Collateral Offered
                  </label>
                  <input
                    type="text"
                    name="collateral"
                    value={formData.collateral}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="e.g., Land title, equipment"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Document Upload */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Required Documents</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    National ID Document *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors bg-gray-50 dark:bg-gray-700/50">
                    <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload clear photo of your National ID
                    </p>
                    <input
                      type="file"
                      name="idDocument"
                      required
                      onChange={handleInputChange}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="idDocument"
                    />
                    <label
                      htmlFor="idDocument"
                      className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                    {formData.idDocument && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        ✓ {formData.idDocument.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Land Ownership Proof
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors bg-gray-50 dark:bg-gray-700/50">
                    <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload land title or rental agreement
                    </p>
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
                      className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                    {formData.landDocument && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        ✓ {formData.landDocument.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recent Photograph
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors bg-gray-50 dark:bg-gray-700/50">
                    <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload a recent passport-sized photo
                    </p>
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
                      className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                    {formData.photo && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        ✓ {formData.photo.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Submit Application
              </button>
            )}
          </div>
        </form>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>Your information is secure and will only be used for loan processing purposes.</p>
          <p className="mt-2">Contact: {institutionData?.contact || 'Loading...'} | {institutionData?.email || 'info@agrifin.mw'}</p>
        </div>
      </div>
    </div>
  );
}