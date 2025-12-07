import "./EMITable.css";

const EMITable = ({ emiData }) => {
  if (!emiData || emiData.length === 0) {
    return <div className="no-emi">No active EMI found.</div>;
  }

  return (
    <div className="emi-table-container">
      <table className="emi-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Original Amount</th>
            <th>EMI Amount</th>
            <th>Tenure</th>
            <th>Paid / Total</th>
            <th>Next EMI Date</th>
            <th>Next Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {emiData.map((emi, index) => (
            <tr key={index} className={`emi-row ${emi.status.toLowerCase()}`}>
              <td className="transaction-id">{emi.transactionId}</td>
              <td className="amount">₹{emi.originalAmount.toLocaleString()}</td>
              <td className="emi-amount">₹{emi.emiAmount.toLocaleString()}</td>
              <td className="tenure">{emi.tenure} months</td>
              <td className="progress">
                <span className="paid">{emi.paidInstallments}</span> / <span className="total">{emi.paidInstallments + emi.remainingInstallments}</span>
              </td>
              <td className="next-date">{emi.nextEMIDate}</td>
              <td className="next-amount">₹{emi.nextEMIAmount.toLocaleString()}</td>
              <td className="status">
                <span className={`status-badge ${emi.status.toLowerCase()}`}>
                  {emi.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EMITable;
