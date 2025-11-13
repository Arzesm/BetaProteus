/**
 * SwissEph WASM Configuration
 * 
 * This module MUST be imported BEFORE any SwissEph usage
 * to ensure correct WASM file paths on Vercel deployment
 */

// CRITICAL: Set Module.locateFile BEFORE importing SwissEph anywhere in the app
console.log('🚀 Configuring global Module.locateFile for SwissEph');

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.Module = window.Module || {};
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.Module.locateFile = (path: string, prefix: string) => {
    console.log('🔧 locateFile called:', path, 'prefix:', prefix);
    
    // Handle both absolute and relative paths for WASM files
    // Redirect ALL swisseph.wasm/.data requests to files in public/ root
    if (path.includes('swisseph.wasm') || (typeof path === 'string' && path.endsWith('.wasm'))) {
      console.log('✅ Returning /swisseph.wasm (from root)');
      return '/swisseph.wasm';
    }
    if (path.includes('swisseph.data') || (typeof path === 'string' && path.endsWith('.data'))) {
      console.log('✅ Returning /swisseph.data (from root)');
      return '/swisseph.data';
    }
    
    // Fallback for other files
    if (path.startsWith('http') || path.startsWith('data:')) {
      console.log('↪️ Returning absolute path unchanged:', path);
      return path;
    }
    
    const result = `${prefix}${path}`;
    console.log('⚠️ Returning default:', result);
    return result;
  };
  
  console.log('✅ Module.locateFile configured successfully');
}

export {};

