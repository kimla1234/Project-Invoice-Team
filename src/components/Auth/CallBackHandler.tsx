'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { setAccessToken } from '@/redux/feature/auth/authSlice';
import { useToast } from "@/hooks/use-toast";

const CallbackHandler: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // ប្រើ Ref ដើម្បីការពារកុំឱ្យ handleCallback រត់ ២ ដង (Strict Mode)
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const handleCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (!accessToken || !refreshToken) {
        setError("Missing authentication tokens.");
        return;
      }

      try {
        
        const response = await fetch('/api/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to store session. Please try again.");
        }

        
        dispatch(setAccessToken(accessToken));
        
        toast({
            title: "Logged in Successfully 🎉",
            description: "Your action was completed successfully.",
            variant: "success", 
            duration: 2000,
          });


        router.push('/');
        
      } catch (err: any) {
        console.error("Auth Error:", err);
        setError(err.message || "An unexpected error occurred.");
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: err.message,
        });
      }
    };

    handleCallback();
  }, [router, dispatch, toast]);


  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <h1 className="text-red-500 font-bold text-xl">Authentication Error</h1>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={() => router.push('/login')} 
          className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition"
        >
          Back to Login
        </button>
      </div>
    );
  }


  return (
    <div className="flex justify-center items-center h-screen flex-col gap-4 bg-gray-50">
       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
       <p className="text-gray-600 animate-pulse font-medium">Verifying your session...</p>
    </div>
  );
};

export default CallbackHandler;