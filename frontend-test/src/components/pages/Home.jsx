import React from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaWallet, FaMobile, FaShieldAlt } from "react-icons/fa";

const Home = () => {
  const features = [
    {
      icon: <FaChartLine className="text-4xl text-blue-600" />,
      title: "Smart Analytics",
      description:
        "Visualize your spending patterns with interactive charts and insights",
    },
    {
      icon: <FaWallet className="text-4xl text-green-600" />,
      title: "Budget Management",
      description: "Set and track budgets easily with our intuitive interface",
    },
    {
      icon: <FaMobile className="text-4xl text-purple-600" />,
      title: "Mobile Friendly",
      description:
        "Access your expenses anytime, anywhere with our responsive design",
    },
    {
      icon: <FaShieldAlt className="text-4xl text-red-600" />,
      title: "Secure Platform",
      description: "Your financial data is protected with bank-level security",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Take Control of Your{" "}
              <span className="text-blue-600">Finances</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              ExpenseMate helps you track expenses, manage budgets, and achieve
              your financial goals with ease.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started - It's Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose ExpenseMate?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Managing Your Expenses?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who trust ExpenseMate for their financial
              management
            </p>
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 ExpenseMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
