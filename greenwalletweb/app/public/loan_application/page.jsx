import { Suspense } from 'react';
import LoanApplicationContent from './LoanApplicationContent';

export default function ApplyLoanPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoanApplicationContent />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Application Form</h2>
        <p className="text-gray-600 dark:text-gray-300">Please wait while we load your form...</p>
      </div>
    </div>
  );
}