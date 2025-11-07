'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Building, User, IdCard, Camera, MapPin, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/superbase';

export default function KYCVerification() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [basicData, setBasicData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [kycData, setKycData] = useState({
    // Step 1: Address & Contact Details
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    
    // Step 2: Security Setup
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    
    // Step 3: Business Registration
    registrationNumber: '',
    taxId: '',
    businessType: '',
    registrationDate: '',
    registrationDocument: null,
    
    // Step 4: Legal Documents
    licenseNumber: '',
    licenseDocument: null,
    regulatoryBody: '',
    
    // Step 5: Financial Information
    bankName: '',
    accountNumber: '',
    bankDocument: null,
    
    // Step 6: Contact Verification
    idType: '',
    idNumber: '',
    idDocument: null,
    idSelfie: null
  });

  const steps = [
    { number: 1, title: 'Address & Contact', description: 'Complete your business address' },
    { number: 2, title: 'Security Setup', description: 'Set up password and security' },
    { number: 3, title: 'Business Registration', description: 'Verify business details' },
    { number: 4, title: 'Legal Documents', description: 'Upload required licenses' },
    { number: 5, title: 'Financial Information', description: 'Bank account verification' },
    { number: 6, title: 'Contact Verification', description: 'ID and selfie verification' }
  ];

  useEffect(() => {
    // Retrieve basic data from sessionStorage
    const storedData = sessionStorage.getItem('microfinanceBasicData');
    if (!storedData) {
      router.push('/');
      return;
    }
    setBasicData(JSON.parse(storedData));
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setKycData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setKycData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleFileUpload = (fieldName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setKycData(prev => ({
          ...prev,
          [fieldName]: file
        }));
      }
    };
    input.click();
  };

  const uploadFileToSupabase = async (file, filePath) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) throw error;
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Validate passwords match
      if (kycData.password !== kycData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (kycData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: basicData.email,
        password: kycData.password,
        options: {
          data: {
            institution_name: basicData.institutionName,
            contact_person: basicData.contactPerson,
            phone: basicData.phone,
            user_type: 'microfinance_admin'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // 2. Upload documents to Supabase Storage
      let registrationDocumentUrl = null;
      let licenseDocumentUrl = null;
      let bankDocumentUrl = null;
      let idDocumentUrl = null;
      let idSelfieUrl = null;

      // Upload registration document
      if (kycData.registrationDocument) {
        const registrationPath = `registration/${authData.user.id}/${Date.now()}_${kycData.registrationDocument.name}`;
        registrationDocumentUrl = await uploadFileToSupabase(kycData.registrationDocument, registrationPath);
      }

      // Upload license document
      if (kycData.licenseDocument) {
        const licensePath = `license/${authData.user.id}/${Date.now()}_${kycData.licenseDocument.name}`;
        licenseDocumentUrl = await uploadFileToSupabase(kycData.licenseDocument, licensePath);
      }

      // Upload bank document
      if (kycData.bankDocument) {
        const bankPath = `bank/${authData.user.id}/${Date.now()}_${kycData.bankDocument.name}`;
        bankDocumentUrl = await uploadFileToSupabase(kycData.bankDocument, bankPath);
      }

      // Upload ID document
      if (kycData.idDocument) {
        const idPath = `id/${authData.user.id}/${Date.now()}_${kycData.idDocument.name}`;
        idDocumentUrl = await uploadFileToSupabase(kycData.idDocument, idPath);
      }

      // Upload selfie
      if (kycData.idSelfie) {
        const selfiePath = `selfie/${authData.user.id}/${Date.now()}_${kycData.idSelfie.name}`;
        idSelfieUrl = await uploadFileToSupabase(kycData.idSelfie, selfiePath);
      }

      // 3. Save institution data to Supabase database
      const { error: dbError } = await supabase
        .from('microfinance_institutions')
        .insert([
          {
            id: authData.user.id,
            institution_name: basicData.institutionName,
            email: basicData.email,
            phone: basicData.phone,
            contact_person: basicData.contactPerson,
            address: kycData.address,
            city: kycData.city,
            state: kycData.state,
            postal_code: kycData.postalCode,
            country: kycData.country,
            registration_number: kycData.registrationNumber,
            tax_id: kycData.taxId,
            business_type: kycData.businessType,
            registration_date: kycData.registrationDate,
            registration_document_url: registrationDocumentUrl,
            license_number: kycData.licenseNumber,
            license_document_url: licenseDocumentUrl,
            regulatory_body: kycData.regulatoryBody,
            bank_name: kycData.bankName,
            account_number: kycData.accountNumber,
            bank_document_url: bankDocumentUrl,
            id_type: kycData.idType,
            id_number: kycData.idNumber,
            id_document_url: idDocumentUrl,
            id_selfie_url: idSelfieUrl,
            security_question: kycData.securityQuestion,
            security_answer: kycData.securityAnswer,
            kyc_status: 'approved',
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      // Clear stored data
      sessionStorage.removeItem('microfinanceBasicData');
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Business Address Details</h3>
              <p className="text-sm text-muted-foreground mt-1">Please provide your complete business address for verification.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Street Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={kycData.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter street address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={kycData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="City"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State/Province *
                </label>
                <input
                  type="text"
                  name="state"
                  value={kycData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={kycData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Postal code"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Country *
                </label>
                <select
                  name="country"
                  value={kycData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                >
                  <option value="">Select country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="ng">Nigeria</option>
                  <option value="ke">Kenya</option>
                  <option value="za">South Africa</option>
                  <option value="in">India</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Security Setup</h3>
              <p className="text-sm text-muted-foreground mt-1">Set up your account password and security question.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={kycData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Create secure password"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters with letters and numbers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={kycData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Security Question *
                </label>
                <select
                  name="securityQuestion"
                  value={kycData.securityQuestion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                >
                  <option value="">Select a security question</option>
                  <option value="mother_maiden">What is your mother's maiden name?</option>
                  <option value="pet_name">What was the name of your first pet?</option>
                  <option value="birth_city">In what city were you born?</option>
                  <option value="high_school">What high school did you attend?</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Security Answer *
                </label>
                <input
                  type="text"
                  name="securityAnswer"
                  value={kycData.securityAnswer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter your answer"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Business Registration Details</h3>
              <p className="text-sm text-muted-foreground mt-1">Provide official business registration information.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Registration Number *
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={kycData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter registration number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tax Identification Number *
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={kycData.taxId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter TIN"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Type *
                </label>
                <select
                  name="businessType"
                  value={kycData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                >
                  <option value="">Select business type</option>
                  <option value="llc">Limited Liability Company</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="cooperative">Cooperative</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Registration Date *
                </label>
                <input
                  type="date"
                  name="registrationDate"
                  value={kycData.registrationDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Registration Certificate *
              </label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleFileUpload('registrationDocument')}
              >
                {kycData.registrationDocument ? (
                  <div className="flex items-center justify-center space-x-3 text-green-600">
                    <FileText className="h-10 w-10" />
                    <div className="text-left">
                      <p className="font-medium">{kycData.registrationDocument.name}</p>
                      <p className="text-sm text-muted-foreground">Click to change file</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg text-muted-foreground font-medium">Upload Registration Certificate</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Legal Documents</h3>
              <p className="text-sm text-muted-foreground mt-1">Upload required licenses and regulatory documents.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={kycData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter license number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Regulatory Body *
                </label>
                <input
                  type="text"
                  name="regulatoryBody"
                  value={kycData.regulatoryBody}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="e.g., Central Bank"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload License Document *
              </label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleFileUpload('licenseDocument')}
              >
                {kycData.licenseDocument ? (
                  <div className="flex items-center justify-center space-x-3 text-green-600">
                    <FileText className="h-10 w-10" />
                    <div className="text-left">
                      <p className="font-medium">{kycData.licenseDocument.name}</p>
                      <p className="text-sm text-muted-foreground">Click to change file</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg text-muted-foreground font-medium">Upload License Document</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Financial Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Provide your business bank account details.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={kycData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter bank name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={kycData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter account number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Bank Statement or Proof of Account *
              </label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleFileUpload('bankDocument')}
              >
                {kycData.bankDocument ? (
                  <div className="flex items-center justify-center space-x-3 text-green-600">
                    <FileText className="h-10 w-10" />
                    <div className="text-left">
                      <p className="font-medium">{kycData.bankDocument.name}</p>
                      <p className="text-sm text-muted-foreground">Click to change file</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg text-muted-foreground font-medium">Upload Bank Document</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Contact Person Verification</h3>
              <p className="text-sm text-muted-foreground mt-1">Verify the identity of the contact person.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID Type *
                </label>
                <select
                  name="idType"
                  value={kycData.idType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                >
                  <option value="">Select ID type</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID</option>
                  <option value="voters_id">Voter's ID</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID Number *
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={kycData.idNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter ID number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload ID Document *
                </label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleFileUpload('idDocument')}
                >
                  {kycData.idDocument ? (
                    <div className="flex items-center justify-center space-x-3 text-green-600">
                      <IdCard className="h-8 w-8" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{kycData.idDocument.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <IdCard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-md text-muted-foreground font-medium">Upload ID Document</p>
                      <p className="text-xs text-muted-foreground mt-1">Front & Back</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload Selfie with ID *
                </label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleFileUpload('idSelfie')}
                >
                  {kycData.idSelfie ? (
                    <div className="flex items-center justify-center space-x-3 text-green-600">
                      <Camera className="h-8 w-8" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{kycData.idSelfie.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-md text-muted-foreground font-medium">Upload Selfie with ID</p>
                      <p className="text-xs text-muted-foreground mt-1">Clear face and ID visible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step content</div>;
    }
  };

  if (!basicData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">KYC Verification</h1>
            <p className="text-muted-foreground mt-2">
              Complete your microfinance institution registration
            </p>
          </div>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.number
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border text-muted-foreground'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Current Step Indicator */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <button
                onClick={handleBack}
                className="px-8 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : currentStep === steps.length ? (
                  'Complete Registration'
                ) : (
                  'Next Step'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}