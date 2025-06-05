import Footer from "@/components/footer";
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col h-dvh w-full items-center">
      <div className="flex-grow w-full max-w-3xl flex items-center justify-center px-4"> 
        {children} 
      </div>
      <Footer />
    </div>
  );
}