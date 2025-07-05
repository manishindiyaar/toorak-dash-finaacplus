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
const ALLOWED_STATUS = ['Pending','Approved','Declined','Funded','All Paid'];

// Create loan tool for AI
const loansTool = tool({
  description: 'Get loan details from the database. Use this tool when users ask about loans, loan data, or specific loan information.',
  parameters: z.object({
    count: z.number().optional().describe('Number of loans to return, defaults to 10'),
    status: z.string().optional().describe('Filter by loan status (Funded, Approved, Pending, Declined)'),
    propertyType: z.string().optional().describe('Filter by property type (Residential, Commercial, Industrial, etc.)'),
    location: z.string().optional().describe('Filter by location/state'),
  }),
  execute: async function ({ count = 10, status, propertyType, location }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredLoans = [...loans];
    
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
    
    filteredLoans.sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate));
    
    return {
      loans: filteredLoans.slice(0, count),
      total: filteredLoans.length,
      // This indicates whether any filters were applied to the loans
      // If true, it means the results were filtered by status, propertyType, or location
      // If false, it means all loans are being returned without filtering
      filtered: filteredLoans.length < loans.length
    };
  },
});

// AI Chat API route
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const result = streamText({
      model: google('gemini-2.5-flash-preview-04-17'),
      system: 'You are a helpful assistant for a loan management system. When users ask about loans, ALWAYS use the getLoanDetails tool to fetch and display the information. Do NOT describe or list the loan details in text - the tool will handle displaying the loan cards. Only provide brief confirmations like "Here are the loans that match your criteria:" or "I found the following loans:" and let the tool results show the data.',
      messages,
      maxSteps: 5,
      tools: {
        getLoanDetails: loansTool,
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



