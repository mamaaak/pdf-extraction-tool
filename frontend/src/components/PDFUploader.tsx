import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface PDFUploaderProps {
  onUploadStart: () => void;
  onAnalysisComplete: (data: any) => void;
  onError: (message: string) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ 
  onUploadStart, 
  onAnalysisComplete, 
  onError 
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      onError('Only PDF files are supported.');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size exceeds 10MB limit.');
      return;
    }

    onUploadStart();

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post(`${apiUrl}/api/documents/extract`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onAnalysisComplete(response.data);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      onError(
        error instanceof Error 
          ? error.message 
          : 'Failed to process PDF. Please try again.'
      );
    }
  }, [apiUrl, onUploadStart, onAnalysisComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 cursor-pointer text-center transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <svg 
            className={`w-12 h-12 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          {isDragActive ? (
            <p className="text-blue-500 font-medium">Drop the PDF here</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop a PDF file here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">Supported format: PDF (max 10MB)</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;