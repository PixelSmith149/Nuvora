// app/providers.tsx

"use client";

import type React from "react";
import { AppSessionProvider } from "@/components/providers/AppSessionProvider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from '@/components/providers/LanguageProvider';


export function Providers({ children }: { children: React.ReactNode }) {
	return (
		  <LanguageProvider>
		    <ThemeProvider>
		      <AppSessionProvider>
			    {children}
			   <Toaster />
		     </AppSessionProvider>
		    </ThemeProvider>
		   </LanguageProvider>
	);
}
