import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, Calendar, Percent, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Loan {
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

interface InterestResult {
  loanId: string;
  borrower: string;
  loanAmount: number;
  loanDate: string;
  daysElapsed: number;
  interestPerc: number;
  accruedInterest: number;
}

function InterestCalculator() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [customInterestRate, setCustomInterestRate] = useState<string>("");
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [calculationResult, setCalculationResult] = useState<InterestResult | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/loans');
      const loansData = await response.json();
      setLoans(loansData);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to fetch loans');
    }
  };

  const handleLoanSelect = (loanId: string) => {
    setSelectedLoanId(loanId);
    const loan = loans.find(l => l.id === loanId);
    setSelectedLoan(loan || null);
    setCalculationResult(null);
    
    // Reset custom rate when selecting a new loan
    if (loan) {
      setCustomInterestRate(loan.interestPerc.toString());
    }
  };

  const calculateInterest = async () => {
    if (!selectedLoanId) {
      toast.error('Please select a loan first');
      return;
    }

    if (useCustomRate && (!customInterestRate || parseFloat(customInterestRate) <= 0)) {
      toast.error('Please enter a valid interest rate');
      return;
    }

    setLoading(true);
    
    try {
      const url = useCustomRate 
        ? `http://localhost:3000/api/loans/${selectedLoanId}/interest?interestPerc=${customInterestRate}`
        : `http://localhost:3000/api/loans/${selectedLoanId}/interest`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to calculate interest');
      }
      
      const result = await response.json();
      setCalculationResult(result);
      toast.success('Interest calculated successfully');
    } catch (error) {
      console.error('Error calculating interest:', error);
      toast.error('Failed to calculate interest');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Funded':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'All Paid':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-red-100 text-red-800 hover:bg-red-200';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Interest Calculator</h1>
          <p className="text-muted-foreground">Calculate accrued interest for your loans</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input Section */}
        <div className="space-y-6">
          {/* Loan Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Select Loan</span>
              </CardTitle>
              <CardDescription>
                Choose a loan to calculate accrued interest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan-select">Loan</Label>
                <Select value={selectedLoanId} onValueChange={handleLoanSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a loan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loans.map((loan) => (
                      <SelectItem key={loan.id} value={loan.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{loan.id}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {loan.borrower} - {formatCurrency(loan.loanAmount)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Loan Details */}
              {selectedLoan && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Borrower:</span>
                    <span>{selectedLoan.borrower}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Property Type:</span>
                    <span>{selectedLoan.propertyType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{selectedLoan.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Loan Amount:</span>
                    <span className="font-semibold">{formatCurrency(selectedLoan.loanAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusBadgeColor(selectedLoan.status)}>
                      {selectedLoan.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Loan Date:</span>
                    <span>{formatDate(selectedLoan.loanDate)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interest Rate Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Percent className="h-5 w-5" />
                <span>Interest Rate</span>
              </CardTitle>
              <CardDescription>
                Use stored rate or enter a custom rate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="use-custom-rate"
                  checked={useCustomRate}
                  onChange={(e) => setUseCustomRate(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="use-custom-rate">Use custom interest rate</Label>
              </div>

              {useCustomRate && (
                <div className="space-y-2">
                  <Label htmlFor="custom-rate">Custom Interest Rate (%)</Label>
                  <Input
                    id="custom-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={customInterestRate}
                    onChange={(e) => setCustomInterestRate(e.target.value)}
                    placeholder="Enter interest rate..."
                  />
                </div>
              )}

              {selectedLoan && !useCustomRate && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Using stored rate: {selectedLoan.interestPerc}%
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={calculateInterest} 
                disabled={!selectedLoanId || loading}
                // className="w-full"
                className="bg-blue-500 hover:bg-blue-600 text-gray-800"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4" />
                    <span>Calculate Interest</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results Section */}
        <div className="space-y-6">
          {calculationResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Interest Calculation Results</span>
                </CardTitle>
                <CardDescription>
                  Accrued interest from loan date to today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Loan ID</Label>
                    <div className="font-mono text-sm">{calculationResult.loanId}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Borrower</Label>
                    <div className="font-medium">{calculationResult.borrower}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Principal Amount:</span>
                    <span className="text-lg font-semibold">{formatCurrency(calculationResult.loanAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Interest Rate:</span>
                    <span className="text-lg font-semibold">{calculationResult.interestPerc}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Loan Date:</span>
                    <span className="text-lg font-semibold">{formatDate(calculationResult.loanDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Days Elapsed:</span>
                    <span className="text-lg font-semibold">{calculationResult.daysElapsed} days</span>
                  </div>
                </div>

                <Separator />

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-green-900">Accrued Interest:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculationResult.accruedInterest)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-blue-900">Total Amount Due:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculationResult.loanAmount + calculationResult.accruedInterest)}
                    </span>
                  </div>
                </div>

                {/* Calculation Details */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Calculation Details:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• Simple Interest Formula: Principal × Rate × Time</div>
                    <div>• Time calculated in years: {calculationResult.daysElapsed} days ÷ 365 = {(calculationResult.daysElapsed / 365).toFixed(4)} years</div>
                    <div>• Interest = {formatCurrency(calculationResult.loanAmount)} × {calculationResult.interestPerc}% × {(calculationResult.daysElapsed / 365).toFixed(4)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>Results</span>
                </CardTitle>
                <CardDescription>
                  Select a loan and click calculate to see results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <div className="text-center">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No calculation performed yet</p>
                    <p className="text-sm">Select a loan and click calculate to see interest details</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterestCalculator; 