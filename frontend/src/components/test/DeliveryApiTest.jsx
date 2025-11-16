import { useState } from 'react';
import { deliveryApi } from '../../services/deliveryApi';

export default function DeliveryApiTest() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: 'Get Deliveries',
      test: () => deliveryApi.getDeliveries()
    },
    {
      name: 'Get Delivery Stats',
      test: () => deliveryApi.getDeliveryStats()
    },
    {
      name: 'Get Today\'s Deliveries',
      test: () => deliveryApi.getTodaysDeliveries()
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Delivery API Test</h1>
      
      <div className="space-y-4">
        {tests.map(({ name, test }) => (
          <div key={name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{name}</h3>
              <button
                onClick={() => runTest(name, test)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test'}
              </button>
            </div>
            
            {testResults[name] && (
              <div className={`p-3 rounded ${
                testResults[name].success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults[name].success ? (
                  <div>
                    <p className="font-semibold">✅ Success</p>
                    <pre className="mt-2 text-sm overflow-auto">
                      {JSON.stringify(testResults[name].data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">❌ Error</p>
                    <p className="text-sm">{testResults[name].error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
