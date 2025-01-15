import React from 'react';
import { FileText, Home, Settings } from 'lucide-react';
import TestCaseGenerator from './components/TestCaseGenerator';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold">Test Case Generator</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Home className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI-Powered Test Case Generator
            </h1>
            <p className="text-gray-600">
              Upload your requirements document and let AI generate comprehensive test cases
            </p>
          </div>

          {/* Test Case Generator Component */}
          <div className="bg-white rounded-lg shadow">
            <TestCaseGenerator />
          </div>

          {/* Footer Section */}
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 Test Case Generator. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;