"use client";

import { useState } from 'react';
import Link from 'next/link';
import PDFUploader from '../components/PDFUploader';
import ResultsDisplay from '../components/ResultsDisplay';
import { FileUpIcon, BarChart3Icon, FileTextIcon, SparklesIcon, TrendingUpIcon, ShieldCheckIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = (data: any) => {
    setResults(data);
    setIsLoading(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="mb-16 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl -mx-4 -my-8 opacity-60"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Document Analysis</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">PDF Analysis</span>
            <br />
            <span className="text-gray-900">Made Simple</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform your PDF documents into actionable insights with our advanced AI technology. 
            Extract, analyze, and visualize data with unprecedented accuracy and speed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group">
              <Link href="/upload">
                <FileUpIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                Start Analyzing
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
              <Link href="/dashboard">
                <BarChart3Icon className="mr-3 h-5 w-5" />
                View Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                <span>Secure Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-500" />
                <span>98% Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-purple-500" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to transform your documents into actionable insights
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:-translate-y-2 animate-fade-in-scale">
            <CardHeader className="space-y-4 pb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FileUpIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">Smart Upload</CardTitle>
              <CardDescription className="text-gray-600">
                Drag & drop files up to 100MB with instant validation
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-gray-700 leading-relaxed">
                Intuitive interface with real-time file validation, preview capabilities, and batch processing support for multiple documents.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full group-hover:bg-blue-50 transition-colors">
                <Link href="/upload">
                  Try Upload
                  <FileUpIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 hover:-translate-y-2 animate-fade-in-scale delay-100">
            <CardHeader className="space-y-4 pb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">AI Analysis</CardTitle>
              <CardDescription className="text-gray-600">
                Advanced LLM-powered text extraction and processing
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-gray-700 leading-relaxed">
                State-of-the-art Groq LLM technology extracts structured data from unstructured PDFs with 98% accuracy and contextual understanding.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full group-hover:bg-purple-50 transition-colors">
                <Link href="/documents">
                  Learn More
                  <SparklesIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-white to-green-50 hover:-translate-y-2 animate-fade-in-scale delay-200">
            <CardHeader className="space-y-4 pb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BarChart3Icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">Rich Visualizations</CardTitle>
              <CardDescription className="text-gray-600">
                Interactive charts and comprehensive analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-gray-700 leading-relaxed">
                Transform extracted data into beautiful, interactive visualizations with export capabilities in multiple formats including JSON and CSV.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full group-hover:bg-green-50 transition-colors">
                <Link href="/dashboard">
                  View Dashboard
                  <BarChart3Icon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Quick Upload Section */}
      <Card className="mb-12 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in-scale">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <FileUpIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Try It Now</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Upload a PDF document to experience our AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <PDFUploader 
            onUploadStart={() => {
              setIsLoading(true);
              setError(null);
            }}
            onAnalysisComplete={handleAnalysisComplete}
            onError={handleError}
          />
          
          {isLoading && (
            <div className="mt-8 text-center animate-fade-in-scale">
              <div className="relative">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-lg font-medium text-gray-900">Processing your document</p>
                <p className="text-sm text-gray-600">This may take a few seconds...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl animate-fade-in-scale">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                <div>
                  <p className="font-medium text-red-900">Upload Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {results && !isLoading && (
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50 animate-fade-in-scale">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <BarChart3Icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Analysis Complete!</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your document has been successfully processed
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <ResultsDisplay results={results} />
          </CardContent>
        </Card>
      )}
    </>
  );
}