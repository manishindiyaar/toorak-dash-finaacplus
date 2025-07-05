// const fetch = require('node-fetch');

fetch('http://localhost:3000/api/summary')
    .then(res=>res.json())
    .then(data=>console.log("Summary: ". data));

//Add new loan

fetch('http://localhost:3000/api/loans', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'

    },
    body: JSON.stringify({

        borrower: 'Delda Raju',
        propertyType: 'Residential',
        location: 'Florida',
        loanAmount: 100000,
        ltv: 56,
        status: 'Funded',
        loanDate: '2024-03-21'

    })
})
    .then(res=>res.json())
    .then(data=>console.log(
        "New Loan added ✅ : ", data
    ))
    