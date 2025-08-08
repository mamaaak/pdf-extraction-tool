import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, AlertCircleIcon, FileIcon, XIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string[];
  maxSize?: number;
  label?: string;
  className?: string;
}

export function FileDropzone({
  onFileSelect,
  acceptedFileTypes = ['application/pdf'],
  maxSize = 100 * 1024 * 1024, // 100MB
  label = 'Upload PDF',
  className,
}: FileDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
  });

  const isFileTooLarge = fileRejections.length > 0 && fileRejections[0].file.size > maxSize;
  const isFileTypeRejected = fileRejections.length > 0 && !isFileTooLarge;

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 transition-colors',
          'flex flex-col items-center justify-center cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          selectedFile && 'border-muted bg-muted/20',
          className
        )}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex items-center space-x-4 w-full">
            <div className="bg-muted p-2 rounded-md">
              <FileIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <>
            {isDragActive ? (
              <UploadIcon className="h-10 w-10 text-primary mb-4" />
            ) : (
              <UploadIcon className="h-10 w-10 text-muted-foreground mb-4" />
            )}
            <p className="mb-1 text-sm font-medium">
              {isDragActive ? 'Drop the file here' : label}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Drag & drop a PDF file here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: {(maxSize / (1024 * 1024)).toFixed(0)} MB
            </p>
          </>
        )}
      </div>

      {isFileTypeRejected && (
        <div className="flex items-center text-destructive text-sm mt-2">
          <AlertCircleIcon className="h-4 w-4 mr-1" />
          <span>File type not accepted. Please upload a PDF file.</span>
        </div>
      )}

      {isFileTooLarge && (
        <div className="flex items-center text-destructive text-sm mt-2">
          <AlertCircleIcon className="h-4 w-4 mr-1" />
          <span>File is too large. Maximum size is {(maxSize / (1024 * 1024)).toFixed(0)} MB.</span>
        </div>
      )}
    </div>
  );
}