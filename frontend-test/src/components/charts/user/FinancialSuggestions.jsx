import React from "react";
import { BiDollar, BiTrendingUp, BiTrendingDown } from "react-icons/bi";
import {
  AiFillWarning,
  AiFillCheckCircle,
  AiFillInfoCircle,
} from "react-icons/ai";

const SuggestionCard = ({ type, message, details }) => {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AiFillWarning className="w-5 h-5 text-yellow-500" />;
      case "positive":
        return <AiFillCheckCircle className="w-5 h-5 text-green-500" />;
      case "critical":
        return <AiFillWarning className="w-5 h-5 text-red-500" />;
      default:
        return <AiFillInfoCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case "warning":
        return "border-yellow-500 bg-yellow-50";
      case "positive":
        return "border-green-500 bg-green-50";
      case "critical":
        return "border-red-500 bg-red-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  return (
    <div className={`border-l-4 rounded-r-lg p-4 ${getColorClass()}`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div>
          <p className="text-sm">{message}</p>
          {details && <div className="mt-2 text-xs opacity-75">{details}</div>}
        </div>
      </div>
    </div>
  );
};

const FinancialSuggestions = ({ suggestions }) => {
  if (!suggestions) return null;

  const {
    summary,
    budget_alerts,
    savings_suggestions,
    general_advice,
  } = suggestions;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Summary Section */}
      {summary && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Financial Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
              <BiDollar className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${summary.total_income.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg flex items-center space-x-3">
              <BiTrendingDown className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${summary.total_expense.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
              <BiTrendingUp className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {summary.savings_rate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Budget Alerts */}
        {budget_alerts?.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Budget Alerts
            </h3>
            <div className="space-y-3">
              {budget_alerts.map((alert, index) => (
                <SuggestionCard
                  key={`budget-${index}`}
                  type="warning"
                  message={alert.message}
                  details={
                    <div className="flex space-x-4">
                      <span>Budget: ${alert.budget.toLocaleString()}</span>
                      <span>Spent: ${alert.spent.toLocaleString()}</span>
                      <span>Overspend: {alert.overspend_percentage}%</span>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Savings Suggestions */}
        {savings_suggestions?.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Savings Tips
            </h3>
            <div className="space-y-3">
              {savings_suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={`savings-${index}`}
                  type={suggestion.type}
                  message={suggestion.message}
                />
              ))}
            </div>
          </div>
        )}

        {/* General Advice */}
        {general_advice?.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              General Advice
            </h3>
            <div className="space-y-3">
              {general_advice.map((advice, index) => (
                <SuggestionCard
                  key={`advice-${index}`}
                  type={advice.type}
                  message={advice.message}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSuggestions;
