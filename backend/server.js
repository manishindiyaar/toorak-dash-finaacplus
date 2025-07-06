const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { streamText } = require('ai');
const { google } = require('@ai-sdk/google');
const { z } = require('zod');
const { tool } = require('ai');

// Set the API key directly
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'AIzaSyA5km69ZFw-c1VDsA7597LoojrsaFWq5zc';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let loans = require('./loan.json');

// Allowed loan statuses
const ALLOWED_STATUS = ['Pending','Approved','Declined','Funded','All Paid','In Review'];

// Enhanced loan search and filter tool
const loansTool = tool({
  description: 'Search and filter loans with comprehensive criteria. Use this tool when users ask about loans, loan data, or specific loan information.',
  parameters: z.object({
    count: z.number().optional().describe('Number of loans to return, defaults to 10'),
    status: z.string().optional().describe('Filter by loan status (Funded, Approved, Pending, Declined, In Review)'),
    propertyType: z.string().optional().describe('Filter by property type (Residential, Commercial, Industrial, Mixed Use, Retail, Office)'),
    location: z.string().optional().describe('Filter by location/state'),
    minLoanAmount: z.number().optional().describe('Minimum loan amount'),
    maxLoanAmount: z.number().optional().describe('Maximum loan amount'),
    minLtv: z.number().optional().describe('Minimum LTV percentage'),
    maxLtv: z.number().optional().describe('Maximum LTV percentage'),
    minInterestRate: z.number().optional().describe('Minimum interest rate percentage'),
    maxInterestRate: z.number().optional().describe('Maximum interest rate percentage'),
    fromDate: z.string().optional().describe('Start date filter (YYYY-MM-DD)'),
    toDate: z.string().optional().describe('End date filter (YYYY-MM-DD)'),
    borrowerName: z.string().optional().describe('Filter by borrower name (partial match)'),
    sortBy: z.enum(['loanAmount', 'loanDate', 'ltv', 'interestPerc', 'borrower']).optional().describe('Sort results by field'),
    sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order (ascending or descending)'),
  }),
  execute: async function ({ 
    count = 10, 
    status, 
    propertyType, 
    location, 
    minLoanAmount, 
    maxLoanAmount, 
    minLtv, 
    maxLtv, 
    minInterestRate, 
    maxInterestRate, 
    fromDate, 
    toDate, 
    borrowerName,
    sortBy = 'loanDate',
    sortOrder = 'desc'
  }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredLoans = [...loans];
    
    // Apply filters
    if (status) {
      filteredLoans = filteredLoans.filter(loan => 
        loan.status.toLowerCase().includes(status.toLowerCase())
      );
    }
    
    if (propertyType) {
      filteredLoans = filteredLoans.filter(loan => 
        loan.propertyType.toLowerCase().includes(propertyType.toLowerCase())
      );
    }
    
    if (location) {
      filteredLoans = filteredLoans.filter(loan => 
        loan.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (minLoanAmount) {
      filteredLoans = filteredLoans.filter(loan => loan.loanAmount >= minLoanAmount);
    }
    
    if (maxLoanAmount) {
      filteredLoans = filteredLoans.filter(loan => loan.loanAmount <= maxLoanAmount);
    }
    
    if (minLtv) {
      filteredLoans = filteredLoans.filter(loan => loan.ltv >= minLtv);
    }
    
    if (maxLtv) {
      filteredLoans = filteredLoans.filter(loan => loan.ltv <= maxLtv);
    }
    
    if (minInterestRate) {
      filteredLoans = filteredLoans.filter(loan => loan.interestPerc >= minInterestRate);
    }
    
    if (maxInterestRate) {
      filteredLoans = filteredLoans.filter(loan => loan.interestPerc <= maxInterestRate);
    }
    
    if (fromDate) {
      filteredLoans = filteredLoans.filter(loan => new Date(loan.loanDate) >= new Date(fromDate));
    }
    
    if (toDate) {
      filteredLoans = filteredLoans.filter(loan => new Date(loan.loanDate) <= new Date(toDate));
    }
    
    if (borrowerName) {
      filteredLoans = filteredLoans.filter(loan => 
        loan.borrower.toLowerCase().includes(borrowerName.toLowerCase())
      );
    }
    
    // Apply sorting
    filteredLoans.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'loanDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'borrower') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return {
      loans: filteredLoans.slice(0, count),
      total: filteredLoans.length,
      totalInDatabase: loans.length,
      filtered: filteredLoans.length < loans.length,
      filters: {
        status,
        propertyType,
        location,
        minLoanAmount,
        maxLoanAmount,
        minLtv,
        maxLtv,
        minInterestRate,
        maxInterestRate,
        fromDate,
        toDate,
        borrowerName
      }
    };
  },
});

// Interest calculation tool
const interestCalculatorTool = tool({
  description: 'Calculate accrued interest for loans. Use this when users want to know interest calculations, accrued interest, or loan payments.',
  parameters: z.object({
    loanId: z.string().optional().describe('Specific loan ID to calculate interest for'),
    loanAmount: z.number().optional().describe('Loan amount for custom calculation'),
    interestRate: z.number().optional().describe('Interest rate percentage for custom calculation'),
    startDate: z.string().optional().describe('Start date for interest calculation (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('End date for interest calculation (YYYY-MM-DD), defaults to today'),
    calculationType: z.enum(['simple', 'compound']).optional().describe('Type of interest calculation (simple or compound)'),
  }),
  execute: async function ({ 
    loanId, 
    loanAmount, 
    interestRate, 
    startDate, 
    endDate, 
    calculationType = 'simple' 
  }) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (loanId) {
      // Calculate for specific loan
      const loan = loans.find(l => l.id === loanId);
      if (!loan) {
        return { error: 'Loan not found' };
      }
      
      const loanDate = new Date(loan.loanDate);
      const today = new Date();
      const endDateObj = endDate ? new Date(endDate) : today;
      const diffDays = Math.floor((endDateObj - loanDate) / (1000 * 60 * 60 * 24));
      const years = diffDays / 365;
      
      let interest;
      if (calculationType === 'compound') {
        interest = loan.loanAmount * (Math.pow((1 + loan.interestPerc / 100), years) - 1);
      } else {
        interest = loan.loanAmount * (loan.interestPerc / 100) * years;
      }
      
      return {
        loanId: loan.id,
        borrower: loan.borrower,
        loanAmount: loan.loanAmount,
        loanDate: loan.loanDate,
        endDate: endDateObj.toISOString().split('T')[0],
        daysElapsed: diffDays,
        years: parseFloat(years.toFixed(4)),
        interestRate: loan.interestPerc,
        calculationType,
        accruedInterest: parseFloat(interest.toFixed(2)),
        totalAmount: parseFloat((loan.loanAmount + interest).toFixed(2))
      };
    } else if (loanAmount && interestRate && startDate) {
      // Custom calculation
      const startDateObj = new Date(startDate);
      const endDateObj = endDate ? new Date(endDate) : new Date();
      const diffDays = Math.floor((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
      const years = diffDays / 365;
      
      let interest;
      if (calculationType === 'compound') {
        interest = loanAmount * (Math.pow((1 + interestRate / 100), years) - 1);
      } else {
        interest = loanAmount * (interestRate / 100) * years;
      }
      
      return {
        loanAmount,
        interestRate,
        startDate,
        endDate: endDateObj.toISOString().split('T')[0],
        daysElapsed: diffDays,
        years: parseFloat(years.toFixed(4)),
        calculationType,
        accruedInterest: parseFloat(interest.toFixed(2)),
        totalAmount: parseFloat((loanAmount + interest).toFixed(2))
      };
    } else {
      return { error: 'Please provide either a loan ID or loan amount, interest rate, and start date' };
    }
  },
});

// Portfolio analytics tool
const portfolioAnalyticsTool = tool({
  description: 'Analyze loan portfolio statistics and provide insights. Use this when users ask about portfolio performance, statistics, summaries, or analytics.',
  parameters: z.object({
    analysisType: z.enum(['summary', 'byStatus', 'byProperty', 'byLocation', 'byLTV', 'byInterestRate', 'trends']).optional().describe('Type of analysis to perform'),
    groupBy: z.enum(['status', 'propertyType', 'location', 'month', 'year']).optional().describe('Group results by field'),
    includeInterest: z.boolean().optional().describe('Include interest calculations in analysis'),
  }),
  execute: async function ({ analysisType = 'summary', groupBy, includeInterest = false }) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const analysis = {
      analysisType,
      totalLoans: loans.length,
      totalLoanAmount: loans.reduce((sum, loan) => sum + loan.loanAmount, 0),
      averageLoanAmount: loans.reduce((sum, loan) => sum + loan.loanAmount, 0) / loans.length,
      averageLTV: loans.reduce((sum, loan) => sum + loan.ltv, 0) / loans.length,
      averageInterestRate: loans.reduce((sum, loan) => sum + loan.interestPerc, 0) / loans.length,
    };
    
    // Status breakdown
    const statusBreakdown = {};
    loans.forEach(loan => {
      if (!statusBreakdown[loan.status]) {
        statusBreakdown[loan.status] = { count: 0, totalAmount: 0 };
      }
      statusBreakdown[loan.status].count++;
      statusBreakdown[loan.status].totalAmount += loan.loanAmount;
    });
    
    // Property type breakdown
    const propertyTypeBreakdown = {};
    loans.forEach(loan => {
      if (!propertyTypeBreakdown[loan.propertyType]) {
        propertyTypeBreakdown[loan.propertyType] = { count: 0, totalAmount: 0 };
      }
      propertyTypeBreakdown[loan.propertyType].count++;
      propertyTypeBreakdown[loan.propertyType].totalAmount += loan.loanAmount;
    });
    
    // Location breakdown
    const locationBreakdown = {};
    loans.forEach(loan => {
      if (!locationBreakdown[loan.location]) {
        locationBreakdown[loan.location] = { count: 0, totalAmount: 0 };
      }
      locationBreakdown[loan.location].count++;
      locationBreakdown[loan.location].totalAmount += loan.loanAmount;
    });
    
    // LTV ranges
    const ltvRanges = {
      'Low Risk (≤60%)': loans.filter(l => l.ltv <= 60).length,
      'Medium Risk (61-75%)': loans.filter(l => l.ltv > 60 && l.ltv <= 75).length,
      'High Risk (>75%)': loans.filter(l => l.ltv > 75).length,
    };
    
    // Interest calculations if requested
    let totalAccruedInterest = 0;
    if (includeInterest) {
      totalAccruedInterest = loans.reduce((sum, loan) => {
        const loanDate = new Date(loan.loanDate);
        const today = new Date();
        const years = (today - loanDate) / (1000 * 60 * 60 * 24 * 365);
        const interest = loan.loanAmount * (loan.interestPerc / 100) * years;
        return sum + interest;
      }, 0);
    }
    
    return {
      ...analysis,
      statusBreakdown,
      propertyTypeBreakdown,
      locationBreakdown,
      ltvRanges,
      totalAccruedInterest: includeInterest ? parseFloat(totalAccruedInterest.toFixed(2)) : null,
      insights: {
        mostCommonStatus: Object.entries(statusBreakdown).reduce((a, b) => statusBreakdown[a[0]].count > statusBreakdown[b[0]].count ? a : b)[0],
        mostCommonPropertyType: Object.entries(propertyTypeBreakdown).reduce((a, b) => propertyTypeBreakdown[a[0]].count > propertyTypeBreakdown[b[0]].count ? a : b)[0],
        topLocationByVolume: Object.entries(locationBreakdown).reduce((a, b) => locationBreakdown[a[0]].totalAmount > locationBreakdown[b[0]].totalAmount ? a : b)[0],
        riskProfile: ltvRanges['High Risk (>75%)'] > loans.length * 0.3 ? 'High Risk Portfolio' : 'Balanced Portfolio'
      }
    };
  },
});

// AI Chat API route
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const result = streamText({
      model: google('gemini-2.5-flash-preview-04-17'),
      system: `You are a helpful assistant for a loan management system. You have access to powerful tools to help users analyze their loan portfolio:

1. Use 'getLoanDetails' to search and filter loans with comprehensive criteria
2. Use 'calculateInterest' to perform interest calculations on loans
3. Use 'analyzePortfolio' to provide statistical analysis and insights

Guidelines:
- Always use the appropriate tool based on the user's request
- When users ask about loans, use getLoanDetails with appropriate filters
- When users ask about interest, payments, or accrued interest, use calculateInterest
- When users ask about portfolio performance, statistics, or analytics, use analyzePortfolio
- Provide clear explanations of the results
- Be helpful and informative in your responses`,
      messages,
      maxSteps: 5,
      tools: {
        getLoanDetails: loansTool,
        calculateInterest: interestCalculatorTool,
        analyzePortfolio: portfolioAnalyticsTool,
      },
    });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Create the stream response
    const stream = result.toDataStreamResponse();
    
    // Handle the stream
    const reader = stream.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.end();
    }

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/loans', (req, res)=>{
    res.json(loans);
})

app.get('/api/totalLoan', (req, res)=>{
    const total = loans.reduce((sum, loan)=> sum + loan.loanAmount, 0);
    res.json({totalLoanAmount: total});
})

app.get('/api/summary', (req, res)=>{
    const summary = loans.map(loan => ({
        borrower: loan.borrower,
        loanAmount: loan.loanAmount
      }));
      res.json(summary);
})

//POST method
app.post('/api/loans', (req, res)=>{
    const newLoan = {
        id: `L00${loans.length + 1}`,
        ...req.body
    }

    // Validate required fields, including the new interestPerc field
    if(!newLoan.borrower || !newLoan.loanAmount || newLoan.interestPerc === undefined)
        return res.status(400).json({error:'Missing required fields (borrower, loanAmount, interestPerc)'});

    // Default status to 'Pending' if none supplied
    newLoan.status = newLoan.status || 'Pending';
    if(!ALLOWED_STATUS.includes(newLoan.status))
        return res.status(400).json({error:`status must be one of: ${ALLOWED_STATUS.join(', ')}`});

    // Ensure interestPerc is a positive number
    newLoan.interestPerc = parseFloat(newLoan.interestPerc);
    if(isNaN(newLoan.interestPerc) || newLoan.interestPerc <= 0)
        return res.status(400).json({error:'interestPerc must be a positive number'});

    loans.push(newLoan);

    fs.writeFile('./loan.json', JSON.stringify(loans, null, 2), (err)=>{
        if(err)
             return res.status(500).json({error:'Failed to save loan'});
        
    });
    res.status(201).json(newLoan);
})

// NEW: Calculate accrued interest for a loan
app.get('/api/loans/:id/interest', (req, res)=>{
    const { id } = req.params;
    const loan = loans.find(l => l.id === id);
    if(!loan) return res.status(404).json({error:'Loan not found'});

    // interestPerc can come from query param or stored on the loan
    let interestPerc = req.query.interestPerc !== undefined ? parseFloat(req.query.interestPerc) : loan.interestPerc;
    if(isNaN(interestPerc) || interestPerc <= 0)
        return res.status(400).json({error:'Valid interestPerc is required (query param or stored on loan)'});

    const loanDate = new Date(loan.loanDate);
    const today = new Date();
    const diffDays = Math.floor( (today - loanDate) / (1000 * 60 * 60 * 24) );
    const years = diffDays / 365;
    const interest = loan.loanAmount * (interestPerc / 100) * years;

    res.json({
        loanId: loan.id,
        borrower: loan.borrower,
        loanAmount: loan.loanAmount,
        loanDate: loan.loanDate,
        daysElapsed: diffDays,
        interestPerc,
        accruedInterest: parseFloat(interest.toFixed(2))
    });
});

// NEW: Update an existing loan (partial update allowed via PUT)
app.put('/api/loans/:id', (req, res)=>{
    const { id } = req.params;
    const index = loans.findIndex(l => l.id === id);
    if(index === -1) return res.status(404).json({error:'Loan not found'});

    const updated = { ...loans[index], ...req.body };

    // Validate status if provided
    if(updated.status && !ALLOWED_STATUS.includes(updated.status))
        return res.status(400).json({error:`status must be one of: ${ALLOWED_STATUS.join(', ')}`});

    // Validate interestPerc if provided
    if(updated.interestPerc !== undefined){
        updated.interestPerc = parseFloat(updated.interestPerc);
        if(isNaN(updated.interestPerc) || updated.interestPerc <= 0)
            return res.status(400).json({error:'interestPerc must be a positive number'});
    }

    loans[index] = updated;
    fs.writeFile('./loan.json', JSON.stringify(loans, null, 2), (err)=>{
        if(err) return res.status(500).json({error:'Failed to save loan'});
        res.json(updated);
    });
});

// NEW: Update only the status field (PATCH)
app.patch('/api/loans/:id/status', (req, res)=>{
    const { id } = req.params;
    const { status } = req.body;
    if(!status) return res.status(400).json({error:'status is required'});
    if(!ALLOWED_STATUS.includes(status))
        return res.status(400).json({error:`status must be one of: ${ALLOWED_STATUS.join(', ')}`});
    const loan = loans.find(l => l.id === id);
    if(!loan) return res.status(404).json({error:'Loan not found'});
    loan.status = status;
    fs.writeFile('./loan.json', JSON.stringify(loans, null, 2), (err)=>{
        if(err) return res.status(500).json({error:'Failed to save loan'});
        res.json(loan);
    });
});

// NEW: Delete a loan
app.delete('/api/loans/:id', (req, res)=>{
    const { id } = req.params;
    const index = loans.findIndex(l => l.id === id);
    if(index === -1) return res.status(404).json({error:'Loan not found'});
    const removed = loans.splice(index, 1)[0];
    fs.writeFile('./loan.json', JSON.stringify(loans, null, 2), (err)=>{
        if(err) return res.status(500).json({error:'Failed to delete loan'});
        res.json(removed);
    });
});

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})



