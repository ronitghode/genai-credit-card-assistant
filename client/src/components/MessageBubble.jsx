import TransactionTable from "./TransactionTable";
import EMITable from "./EMITable";

const MessageBubble = ({ role, content, metadata }) => {
  const isUser = role === "user";
  
  // Check if this message should display a transaction table
  const isTableView = metadata?.isTableView;
  const transactions = metadata?.transactions;
  const emiData = metadata?.emiData;
  const isPdfDownload = metadata?.isPdfDownload;
  const pdfEndpoint = metadata?.pdfEndpoint;
  const pdfParams = metadata?.pdfParams;

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(pdfEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pdfParams)
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element and click it
      const link = document.createElement("a");
      link.href = url;
      link.download = `Statement_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div
      className={`message-bubble ${isUser ? "message-user" : "message-assistant"
        }`}
    >
      {isPdfDownload ? (
        <>
          <p style={{ marginTop: 0, marginBottom: "1rem" }}>{content}</p>
          <button 
            onClick={handleDownloadPDF}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
          >
            📥 Download PDF
          </button>
        </>
      ) : isTableView && transactions ? (
        <>
          <p style={{ marginTop: 0, marginBottom: "1rem" }}>{content}</p>
          <TransactionTable transactions={transactions} />
        </>
      ) : isTableView && emiData ? (
        <>
          <p style={{ marginTop: 0, marginBottom: "1rem" }}>{content}</p>
          <EMITable emiData={emiData} />
        </>
      ) : (
        content
      )}
    </div>
  );
};

export default MessageBubble;
