import React, { useState } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const TestCaseGenerator = () => {
  const [file, setFile] = useState(null);
  const [requirements, setRequirements] = useState('');
  const [testCases, setTestCases] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.docx')) {
      setError('Please upload a .docx file');
      return;
    }

    setFile(uploadedFile);
    // Here you would parse the .docx file content
    // For now, we'll just show the filename
    setRequirements(`File uploaded: ${uploadedFile.name}`);
  };

  const generateTestCases = async () => {
    if (!file) {
      setError('Please upload a requirements document first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // This would be your API endpoint
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/generate-test-cases', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate test cases');
      }

      const data = await response.json();
      setTestCases(data.testCases);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI-Powered Test Case Generator</h1>

      {/* File Upload Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">.docx files only</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".docx" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Requirements Preview */}
      {requirements && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Requirements Content</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Document Preview</span>
            </div>
            <p className="whitespace-pre-wrap">{requirements}</p>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        className={`w-full py-3 px-4 rounded-lg font-medium mb-8 
          ${loading 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        onClick={generateTestCases}
        disabled={loading || !file}
      >
        {loading ? 'Generating Test Cases...' : 'Generate Test Cases'}
      </button>

      {/* Error Alert */}
      {/* {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )} */}

      {/* Test Cases Display */}
      {testCases && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated Test Cases</h2>
            <button
              className="flex items-center gap-2 py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {/* Add download logic */}}
            >
              <Download className="w-4 h-4" />
              Download as DOCX
            </button>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <pre className="whitespace-pre-wrap">{testCases}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseGenerator;