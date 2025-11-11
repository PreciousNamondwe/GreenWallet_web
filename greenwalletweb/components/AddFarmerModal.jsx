'use client';
import { 
  X, Mail, Phone, MapPin, User, Crop, Ruler, IdCard, 
  ArrowRight, ArrowLeft, Calendar, Shield, Banknote, FileText 
} from 'lucide-react';

export default function AddFarmerModal({ 
  showAddFarmerModal, 
  setShowAddFarmerModal,
  addFarmerStep,
  setAddFarmerStep,
  newFarmer,
  setNewFarmer,
  handleAddFarmer,
  nextStep,
  prevStep,
  handleInputChange,
  showToast
}) {
  if (!showAddFarmerModal) return null;

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

  const handleNextStep = () => {
    if (validateStep(addFarmerStep)) {
      nextStep();
    }
  };

  return (
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
                onClick={handleNextStep}
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
  );
}