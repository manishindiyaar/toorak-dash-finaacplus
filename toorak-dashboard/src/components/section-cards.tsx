import React, { useState, useEffect } from "react"
import {  IconTrendingUp, IconCurrencyDollar, IconFileText, IconPercentage } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface LoanData {
  id: string;
  borrower: string;
  propertyType: string;
  location: string;
  loanAmount: number;
  ltv: number;
  interestPerc: number;
  status: string;
  loanDate: string;
}

interface LoanStats {
  totalAmount: number;
  totalLoans: number;
  fundedLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  declinedLoans: number;
  allPaidLoans: number;
}

export function SectionCards() {
  const [loanData, setLoanData] = useState<LoanStats>({
    totalAmount: 0,
    totalLoans: 0,
    fundedLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    declinedLoans: 0,
    allPaidLoans: 0
  })

  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchLoanData()
  }, [])

  const fetchLoanData = async () => {
    try {
      setIsLoading(true)
      
      // Use multiple endpoints for optimized data fetching
      const [totalLoanResponse, loansResponse] = await Promise.all([
        fetch('http://localhost:3000/api/totalLoan'),
        fetch('http://localhost:3000/api/loans')
      ])

      const totalLoanData = await totalLoanResponse.json()
      const loans: LoanData[] = await loansResponse.json()
      
      // Get total amount from dedicated endpoint
      const totalAmount = totalLoanData.totalLoanAmount
      
      // Calculate status counts
      const totalLoans = loans.length
      const fundedLoans = loans.filter((loan: LoanData) => loan.status === 'Funded').length
      const pendingLoans = loans.filter((loan: LoanData) => loan.status === 'Pending').length
      const approvedLoans = loans.filter((loan: LoanData) => loan.status === 'Approved').length
      const declinedLoans = loans.filter((loan: LoanData) => loan.status === 'Declined').length
      const allPaidLoans = loans.filter((loan: LoanData) => loan.status === 'All Paid').length

      setLoanData({
        totalAmount,
        totalLoans,
        fundedLoans,
        pendingLoans,
        approvedLoans,
        declinedLoans,
        allPaidLoans
      })
    } catch (error) {
      console.error('Error fetching loan data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const fundingRate = loanData.totalLoans > 0 ? ((loanData.fundedLoans / loanData.totalLoans) * 100).toFixed(1) : '0'
  const approvalRate = loanData.totalLoans > 0 ? (((loanData.approvedLoans + loanData.fundedLoans) / loanData.totalLoans) * 100).toFixed(1) : '0'

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardFooter>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Loan Portfolio</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(loanData.totalAmount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCurrencyDollar className="w-4 h-4" />
              {loanData.totalLoans} loans
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total value across all loans <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Active loan portfolio
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Funded Loans</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loanData.fundedLoans}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {fundingRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Funding rate: {fundingRate}% <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Successfully funded loans
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Applications</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loanData.pendingLoans}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFileText />
              Review
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Awaiting review and approval <IconFileText className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Requires attention
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Approval Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {approvalRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPercentage />
              Success
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Approved + Funded loans <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Overall approval performance
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
