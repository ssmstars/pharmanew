"use client";

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string) => void;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    setUploadError('');
    
    // Validate file exists
    if (!file) {
      setUploadError('No file selected');
      return;
    }
    
    // Validate file type - be more flexible
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.vcf') && !fileName.includes('vcf')) {
      setUploadError('Please upload a VCF file (.vcf extension required)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError(`File size (${formatFileSize(file.size)}) exceeds 5MB limit`);
      return;
    }

    // Check for empty files
    if (file.size === 0) {
      setUploadError('File appears to be empty');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (content) {
        // More flexible VCF validation
        if (!content.includes('##fileformat=VCF') && !content.includes('#CHROM')) {
          setUploadError('File does not appear to be a valid VCF format. Please ensure it contains VCF headers.');
          return;
        }
        onFileUpload(content);
      } else {
        setUploadError('File content is empty or could not be read');
      }
    };
    reader.onerror = (err) => {
      console.error('FileReader error:', err);
      setUploadError('Failed to read file. Please try again.');
    };
    
    try {
      reader.readAsText(file);
    } catch (err) {
      console.error('Error starting file read:', err);
      setUploadError('Error reading file. Please try again.');
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
      const file = files[0];
      processFile(file);
    } else {
      setUploadError('No file was dropped');
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    } else {
      setUploadError('No file was selected');
    }
    
    // Reset the input value to allow re-uploading the same file
    e.target.value = '';
  }, [processFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayError = uploadError || error;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-5 h-5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Upload VCF File</h2>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-cyan-500 bg-cyan-50 shadow-md' 
            : fileName
            ? 'border-emerald-400 bg-emerald-50 shadow-sm'
            : 'border-slate-300 hover:border-cyan-400 bg-slate-50 hover:bg-cyan-50/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".vcf,.txt"
          onChange={handleFileInput}
          className="hidden"
          id="vcf-upload"
          key={fileName} // Force re-render when file changes
        />
        
        {fileName ? (
          <div className="space-y-4">
            <FileText className="mx-auto h-12 w-12 text-emerald-600" />
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-base sm:text-lg font-medium text-slate-900 break-all">{fileName}</p>
              <p className="text-sm text-slate-600">{formatFileSize(fileSize)}</p>
            </div>
            <label
              htmlFor="vcf-upload"
              className="inline-block px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 font-semibold shadow-sm bg-gradient-to-r from-cyan-700 to-sky-700 text-white hover:from-cyan-800 hover:to-sky-800"
            >
              Upload Different File
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <div>
              <p className="text-base sm:text-lg font-medium text-slate-700">Drop your VCF file here</p>
              <p className="text-sm text-slate-500 mt-1">or</p>
            </div>
            <label
              htmlFor="vcf-upload"
              className="inline-block px-8 py-3 rounded-lg cursor-pointer transition-colors duration-200 font-semibold shadow-sm bg-gradient-to-r from-cyan-700 to-sky-700 text-white hover:from-cyan-800 hover:to-sky-800"
            >
              Choose File
            </label>
            <p className="text-xs text-slate-500 bg-slate-100 rounded px-3 py-1.5 inline-block">Maximum file size: 5MB • VCF format required</p>
          </div>
        )}
      </div>

      {displayError && (
        <div className="bg-rose-50 border-l-4 border-rose-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-rose-800">{displayError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;