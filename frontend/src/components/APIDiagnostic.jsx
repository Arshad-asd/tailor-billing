import React, { useState } from 'react';
import { Button } from './ui/button';

export default function APIDiagnostic() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint, method = 'GET') => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tailor_token')}`
        }
      });
      
      const result = {
        endpoint,
        method,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      };
      
      if (response.ok) {
        try {
          result.data = await response.json();
        } catch (e) {
          result.data = 'Non-JSON response';
        }
      } else {
        try {
          result.error = await response.text();
        } catch (e) {
          result.error = 'Could not read error response';
        }
      }
      
      setResults(prev => ({ ...prev, [endpoint]: result }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [endpoint]: { 
          endpoint, 
          method, 
          error: error.message,
          ok: false 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    const endpoints = [
      '/inventory/items/',
      '/inventory/categories/',
      '/sales/',
      '/users/',
    ];
    
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Diagnostic Tool</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={() => testEndpoint('/inventory/items/')} disabled={loading}>
            Test Items API
          </Button>
          <Button onClick={() => testEndpoint('/inventory/categories/')} disabled={loading}>
            Test Categories API
          </Button>
          <Button onClick={() => testEndpoint('/sales/')} disabled={loading}>
            Test Sales API
          </Button>
          <Button onClick={testAllEndpoints} disabled={loading}>
            Test All APIs
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Results:</h4>
          {Object.entries(results).map(([endpoint, result]) => (
            <div key={endpoint} className="p-3 bg-white dark:bg-gray-700 rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm">{result.method} {endpoint}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.status} {result.statusText}
                </span>
              </div>
              
              {result.data && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Data:</strong> {JSON.stringify(result.data).substring(0, 100)}...
                </div>
              )}
              
              {result.error && (
                <div className="text-sm text-red-600">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
              
              {result.headers && (
                <div className="text-xs text-gray-500 mt-1">
                  <strong>Headers:</strong> {JSON.stringify(result.headers)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
