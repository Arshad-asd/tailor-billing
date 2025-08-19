import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Scissors, Crown, ArrowRight } from 'lucide-react';

const LoginSelection = () => {
  const loginOptions = [
    {
      title: 'Customer',
      description: 'Access your customer account to view orders, track measurements, and manage your tailoring requests.',
      icon: Users,
      href: '/login/customer',
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-50 to-purple-50',
      features: ['View order history', 'Track measurements', 'Manage preferences', 'Customer support']
    },
    {
      title: 'Tailor',
      description: 'Access your tailor dashboard to manage orders, handle measurements, and process billing.',
      icon: Scissors,
      href: '/login/tailor',
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-50 to-teal-50',
      features: ['Order management', 'Measurement tracking', 'Billing & invoicing', 'Customer management']
    },
    {
      title: 'Admin',
      description: 'Secure access to system administration for managing tailors, customers, and platform settings.',
      icon: Crown,
      href: '/login/admin',
      color: 'from-purple-600 to-blue-600',
      bgColor: 'from-purple-50 via-blue-50 to-indigo-100',
      features: ['Tailor management', 'Customer management', 'System settings', 'Platform analytics']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">✂️</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Login</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the appropriate login portal based on your role in our tailoring system
          </p>
        </div>

        {/* Login Options */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loginOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.title}
                  className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${option.bgColor} p-8 text-center`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{option.description}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-8">
                    <div className="space-y-3 mb-8">
                      <h4 className="font-semibold text-gray-900 mb-4">Key Features:</h4>
                      {option.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className={`w-2 h-2 bg-gradient-to-r ${option.color} rounded-full mr-3`}></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Login Button */}
                    <Link
                      to={option.href}
                      className={`w-full bg-gradient-to-r ${option.color} text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center group/btn`}
                    >
                      <span>Login as {option.title}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="font-semibold text-gray-900 mb-2">New to the platform?</h4>
                <p className="text-gray-600 text-sm mb-4">Create a new account to get started with our tailoring system.</p>
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Sign up now →
                </Link>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="font-semibold text-gray-900 mb-2">Forgot your password?</h4>
                <p className="text-gray-600 text-sm mb-4">Reset your password to regain access to your account.</p>
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Reset password →
                </Link>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="font-semibold text-gray-900 mb-2">Need support?</h4>
                <p className="text-gray-600 text-sm mb-4">Contact our support team for assistance with login issues.</p>
                <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Contact support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection; 