import React from 'react';
import './LoanCard.css';

const LoanCard = ({ loan }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLtvClass = (ltv) => {
    if (ltv <= 70) return 'low';
    if (ltv <= 85) return 'medium';
    return 'high';
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(' ', '-');
  };

  const getPropertyTypeClass = (type) => {
    return type.toLowerCase().replace(' ', '-');
  };

  return (
    <div className="loan-card">
      <div className="loan-card-header">
        <div className="loan-id">
          Loan #{loan.id}
        </div>
        <div className={`loan-status ${getStatusClass(loan.status)}`}>
          {loan.status}
        </div>
      </div>
      
      <div className="loan-borrower">
        {loan.borrower}
      </div>
      
      <div className="loan-property">
        {loan.location}
      </div>
      
      <div className="loan-details">
        <div className="loan-detail">
          <div className="loan-detail-label">Loan Amount</div>
          <div className="loan-detail-value loan-amount">
            {formatCurrency(loan.loanAmount)}
          </div>
        </div>
        
        <div className="loan-detail">
          <div className="loan-detail-label">LTV Ratio</div>
          <div className={`loan-detail-value loan-ltv ${getLtvClass(loan.ltv)}`}>
            {loan.ltv}%
          </div>
        </div>
      </div>
      
      <div className="loan-footer">
        <div className="loan-date">
          {formatDate(loan.loanDate)}
        </div>
        <div className={`loan-property-type ${getPropertyTypeClass(loan.propertyType)}`}>
          {loan.propertyType}
        </div>
      </div>
    </div>
  );
};

export default LoanCard; 