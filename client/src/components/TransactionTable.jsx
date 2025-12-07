import "./TransactionTable.css";

const TransactionTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="no-transactions">No transactions found.</div>;
  }

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Balance</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index} className={`transaction-row ${transaction.type.toLowerCase()}`}>
              <td className="index">{index + 1}</td>
              <td className="type">
                <span className={`badge ${transaction.type.toLowerCase()}`}>
                  {transaction.type}
                </span>
              </td>
              <td className="amount">${transaction.amount}</td>
              <td className="description">{transaction.description}</td>
              <td className="balance">${transaction.balanceAfter}</td>
              <td className="datetime">
                {transaction.date} <br /> {transaction.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
