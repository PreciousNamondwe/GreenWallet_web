'use client';
import { 
  X, Globe, Clipboard, Share2, CheckCircle, Plus, Link 
} from 'lucide-react';

export default function WebFormModal({
  showWebFormModal,
  setShowWebFormModal,
  companyName,
  copiedLink,
  webForms,
  generateWebFormLink,
  createNewWebForm,
  shareWebForm,
  toggleFormStatus,
  deleteForm,
  showToast
}) {
  if (!showWebFormModal) return null;

  return (
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
  );
}