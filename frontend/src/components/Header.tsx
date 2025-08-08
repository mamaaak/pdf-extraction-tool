import React from 'react';
import Link from 'next/link';
import { FileUpIcon, BarChart3Icon, FileTextIcon, HomeIcon, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="glass border-b-0 sticky top-0 z-50 shadow-lg">
      <div className="container flex flex-col lg:flex-row items-center justify-between py-4 lg:py-6 gap-6 lg:gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-3 text-white shadow-lg">
              <FileTextIcon className="h-6 w-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-2 w-2 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight gradient-text">
              PDF Analyzer
            </h1>
            <p className="text-xs text-gray-500 hidden lg:block">AI-Powered Document Intelligence</p>
          </div>
        </div>
        
        <nav className="flex flex-wrap gap-2 lg:gap-3 justify-center lg:justify-end">
          <Button asChild variant="ghost" size="sm" className="hover:bg-blue-50 transition-colors">
            <Link href="/">
              <HomeIcon className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          
          <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
            <Link href="/upload">
              <FileUpIcon className="h-4 w-4 mr-2" />
              Upload
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
            <Link href="/dashboard">
              <BarChart3Icon className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="hover:bg-gray-50 transition-colors">
            <Link href="/documents">
              <FileTextIcon className="h-4 w-4 mr-2" />
              Documents
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;