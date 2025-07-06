

# Toorak DealFlow – Loan Management Dashboard

A lightweight proof of concept designed specifically for Toorak Capital, aligned with my application for the React Intern role at FinaacPlus.

## Watch this video

<div style="position: relative; display: inline-block;">
  <a href="https://youtu.be/3JlXZjX-ExQ?si=uDFDFhH0oNf57LJz">
    <img src="https://img.youtube.com/vi/3JlXZjX-ExQ/maxresdefault.jpg" alt="Watch the demo video" style="width: 100%; max-width: 640px;">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png" alt="YouTube Icon" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 48px;">
  </a>
</div>

*Click the image above to watch the demo video*

You can also preview the demo video directly below:

<video width="100%" controls>
  <source src="/photos/toorak-demo-finaacplus - Made with Clipchamp.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>



## Project Context

After receiving the job description for the frontend internship, I wanted to go beyond just preparing answers. I researched Toorak Capital, studied their business model, and built something that could actually provide value — a simple, clean loan management system.

The goal was to show initiative, problem understanding, and practical frontend/backend development skills.

## Screenshots

![Toorak DealFlow Dashboard](/photos/tc1.png)
*Toorak tech ream requirement*


In ordered to follow Micro frontend approach i decided this .

![Toorak DealFlow Dashboard](/photos/mfe.png)
*microfrontend-approach*


.....after thinking for so much i chose to build something i had been been doing very long. Instead of building traditional Dashboard UI let's build something which makes user experience so much smooth.

and i decided these techstacks.
![Toorak DealFlow Dashboard](/photos/slms.png)
*all the core feature*




## Objective

To simulate a real-world workflow similar to Toorak’s, I built a full-stack dashboard that:

- Manages loans data
- Performs basic calculations
- Allows data updates
- Presents insights clearly
- Adds AI-powered query support

## Features

### 1. Loan Overview

Displays a list of loans with attributes like:

- Borrower name
- Location
- Property type
- Loan amount
- LTV (Loan to Value ratio)
- Status (Funded, Pending)
- Loan date

### 2. Custom JSON Database

I decided not to use an actual database so I could practice JavaScript array methods. The JSON file simulates database behavior.

Initial schema:

```json
{
  "id": "L001",
  "borrower": "John Doe",
  "propertyType": "Residential",
  "location": "Texas",
  "loanAmount": 250000,
  "ltv": 72,
  "status": "Funded",
  "loanDate": "2024-04-12"
}

```
Later improved to include interest percentage:

```json
{
  "id": "L001",
  "borrower": "John Doe",
  "propertyType": "Residential",
  "location": "Texas",
  "loanAmount": 250000,
  "interestPerc": 5,
  "ltv": 72,
  "status": "Funded",
  "loanDate": "2024-04-12"
}
```

This addition allows us to calculate interest income and simulate real-world loan profitability.


Backend API

Created using Express.js:
	•	GET /loans – Returns all loan data



Frontend UI
Developed with:
	•	React + Vite
	•	ShadCN UI components
    -  Basic filter and display logic

 
It is Smart loan management system and why i say it smart because we added one more cool feature which is 'AI query' we have created bunch of tools where llm uses those tools to get the task done. 



![Toorak DealFlow Dashboard](/photos/vercel-ai-sdk-ui-gen.png)
*ai-genui-approach*

![Toorak DealFlow Dashboard](/photos/genui1.png)


![Toorak DealFlow Dashboard](/photos/genui2.png)


Here i used vercel ai ask : 
## AI Integration

The system integrates advanced AI capabilities using Vercel AI SDK: [Vercel AI SDK](https://sdk.vercel.ai/docs)
with gemini.

- **AI-Powered Analysis**:  provides the foundation for our intelligent loan analysis system

- **Natural Language Queries**: Users can ask questions about loans in plain English
- **AI-Powered Tools**: Custom tools for loan details, interest calculations, and portfolio analytics
- **Contextual Understanding**: The AI understands loan terminology and provides relevant responses

Example queries:
- "Show me all residential loans in Texas"
- "Calculate the interest on loan L001 over 5 years"
- "What's the total value of all funded loans?"
- "Compare performance of commercial vs residential loans"

The AI integration uses Google's Generative AI with specialized tools:
- `getLoanDetails`: Searches and filters loan data
- `calculateInterest`: Performs interest calculations
- `analyzePortfolio`: Generates portfolio statistics and analytics

...and main thing is that it renders UI not just only texts.

 
 This was built in one day, focused on clarity and problem alignment. Instead of showcasing just skills, this project reflects my thinking process, how I approach business challenges, and my ability to deliver quickly.



 # Setup

 ```
 cd backend
 npm i


 ```
 make sure you have pasted your gemini key here
 
```
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'AIxxxxxxxxxxxxxxxx';
```

then  

```
node server
```


```
cd ai-for-toorak/toorak-ai
npm i
npm run dev
```

it will be running on - http://localhost:5001/

(standalon app) it's Remote App we will then import this app in our main app.


```
cd toorak-dashboard
npm i
npm run dev

```
this is Host App (main app).

it will be running on - http://localhost:5000/





Thankb you :)