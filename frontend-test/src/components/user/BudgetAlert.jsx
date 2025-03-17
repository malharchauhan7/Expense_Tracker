const BudgetAlert = ({ budget }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "danger":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border ${getStatusColor(budget.status)} mb-4`}
    >
      <h3 className="font-semibold mb-2">{budget.title}</h3>
      <div className="flex justify-between mb-2">
        <span>Spent: ${budget.total_spent.toFixed(2)}</span>
        <span>Budget: ${budget.budget_limit.toFixed(2)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${
            budget.status === "danger"
              ? "bg-red-600"
              : budget.status === "warning"
              ? "bg-yellow-600"
              : "bg-green-600"
          }`}
          style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-sm">{budget.message}</p>
    </div>
  );
};

export default BudgetAlert;
