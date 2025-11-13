// CRITICAL: Configure SwissEph WASM paths BEFORE any imports that might use it
console.log('🚀 [main.tsx] Configuring global Module.locateFile for SwissEph');
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Module = window.Module || {};
  // @ts-ignore
  window.Module.locateFile = (path: string, prefix: string) => {
    console.log('🔧 [Global] locateFile called:', path, 'prefix:', prefix);
    
    // Redirect ALL swisseph WASM/DATA requests to root public directory
    if (path.includes('swisseph.wasm') || (typeof path === 'string' && path.endsWith('.wasm'))) {
      console.log('✅ [Global] Returning /swisseph.wasm');
      return '/swisseph.wasm';
    }
    if (path.includes('swisseph.data') || (typeof path === 'string' && path.endsWith('.data'))) {
      console.log('✅ [Global] Returning /swisseph.data');
      return '/swisseph.data';
    }
    
    if (path.startsWith('http') || path.startsWith('data:')) {
      return path;
    }
    
    return `${prefix}${path}`;
  };
  console.log('✅ [main.tsx] Global Module.locateFile configured');
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);