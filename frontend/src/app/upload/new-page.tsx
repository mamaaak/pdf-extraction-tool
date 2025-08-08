"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FileUpIcon, CheckIcon, XIcon, FileTextIcon, AlertCircleIcon, Loader2Icon, BarChart3Icon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      setUploadResult(response.data);
      setIsUploading(false);
    } catch (error: any) {
      setIsUploading(false);
      if (error.response) {
        // Server responded with an error
        setError(error.response.data.error || 'Upload failed. Please try again.');
      } else if (error.request) {
        // Request made but no response received
        setError('No response from server. Please check your connection and try again.');
      } else {
        // Something else went wrong
        setError('Upload failed. Please try again.');
      }
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    setError(null);
    setUploadProgress(0);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight mb-2">PDF Upload</h1>
        <p className="text-muted-foreground mb-6">
          Upload PDF documents for extraction and analysis with Groq LLM
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload PDF Document</CardTitle>
          <CardDescription>
            Select a PDF file (up to 100MB) to extract and analyze its content
          </CardDescription>
        </CardHeader>
        
        {!uploadResult ? (
          <CardContent>
            <div className="space-y-6">
              <FileDropzone 
                onFileSelect={handleFileSelect}
                acceptedFileTypes={['application/pdf']}
                maxSize={100 * 1024 * 1024} // 100MB
                label="Upload PDF"
                className="h-64"
              />
              
              {file && !isUploading && (
                <div className="bg-muted/40 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <FileTextIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <div className="flex flex-wrap text-xs text-muted-foreground gap-x-4">
                        <span>{formatBytes(file.size)}</span>
                        <span>PDF Document</span>
                        <span>Selected {new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="space-y-4">
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-destructive/10 p-4 rounded-md flex items-start gap-3">
                  <AlertCircleIcon className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                {file && (
                  <Button 
                    variant="outline"
                    onClick={resetUpload}
                    disabled={isUploading}
                  >
                    Clear Selection
                  </Button>
                )}
                
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUpIcon className="mr-2 h-4 w-4" />
                      Upload PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-medium text-lg">Upload Successful</h3>
              </div>
              
              <div className="bg-muted/40 p-4 rounded-md mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileTextIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{uploadResult.metadata?.filename}</h4>
                    <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground mt-1">
                      <span>{uploadResult.metadata?.size}</span>
                      <span>Extracted {new Date(uploadResult.metadata?.extractedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Text Preview</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Extracted Text</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="bg-muted/40 p-4 rounded-md max-h-80 overflow-y-auto border text-sm font-mono">
                      {uploadResult.text.length > 1000 
                        ? uploadResult.text.substring(0, 1000) + '...' 
                        : uploadResult.text}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {uploadResult.text.length > 1000 
                        ? `Showing first 1000 characters of ${uploadResult.text.length} total characters`
                        : `${uploadResult.text.length} total characters`}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="metadata">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Document Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(uploadResult.metadata || {}).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-muted-foreground mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p>{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between gap-3 mt-6">
              <Button variant="outline" onClick={resetUpload}>
                <XIcon className="mr-2 h-4 w-4" />
                Upload Another
              </Button>
              
              <Button variant="default" onClick={() => router.push('/dashboard')}>
                <BarChart3Icon className="mr-2 h-4 w-4" />
                View Dashboard
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
}