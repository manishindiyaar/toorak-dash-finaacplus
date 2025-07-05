import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconCurrencyDollar, IconUser, IconMapPin, IconHome, IconPercentage, IconCalendar, IconCheck, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';

const PROPERTY_TYPES = [
  'Residential',
  'Commercial', 
  'Industrial',
  'Mixed Use',
  'Retail',
  'Office',
  'Multifamily'
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const LOAN_STATUSES = ['Pending', 'Approved', 'Declined', 'Funded', 'All Paid'];

export function AddLoanForm({ onLoanAdded }) {
  const [formData, setFormData] = useState({
    borrower: '',
    propertyType: '',
    location: '',
    loanAmount: '',
    ltv: '',
    interestPerc: '',
    status: 'Pending',
    loanDate: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.borrower.trim()) {
      newErrors.borrower = 'Borrower name is required';
    }

    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
      newErrors.loanAmount = 'Valid loan amount is required';
    }

    if (!formData.ltv || parseFloat(formData.ltv) <= 0 || parseFloat(formData.ltv) > 100) {
      newErrors.ltv = 'LTV must be between 1 and 100';
    }

    if (!formData.interestPerc || parseFloat(formData.interestPerc) <= 0) {
      newErrors.interestPerc = 'Valid interest percentage is required';
    }

    if (!formData.loanDate) {
      newErrors.loanDate = 'Loan date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          loanAmount: parseFloat(formData.loanAmount),
          ltv: parseFloat(formData.ltv),
          interestPerc: parseFloat(formData.interestPerc)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create loan');
      }

      const newLoan = await response.json();
      
      // Show success message
      toast.success('Loan created successfully!', {
        description: `Loan ${newLoan.id} for ${newLoan.borrower} has been added.`,
      });

      // Reset form
      setFormData({
        borrower: '',
        propertyType: '',
        location: '',
        loanAmount: '',
        ltv: '',
        interestPerc: '',
        status: 'Pending',
        loanDate: new Date().toISOString().split('T')[0]
      });

      // Notify parent component
      if (onLoanAdded) {
        onLoanAdded(newLoan);
      }

    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error('Failed to create loan', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCurrencyDollar className="h-6 w-6" />
          Add New Loan
        </CardTitle>
        <CardDescription>
          Create a new loan application with borrower and property details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Borrower Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="borrower" className="flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                Borrower Name
              </Label>
              <Input
                id="borrower"
                type="text"
                placeholder="Enter borrower's full name"
                value={formData.borrower}
                onChange={(e) => handleInputChange('borrower', e.target.value)}
                className={errors.borrower ? 'border-red-500' : ''}
              />
              {errors.borrower && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {errors.borrower}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-2">
                <IconCheck className="h-4 w-4" />
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan status" />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge variant="outline">{status}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="propertyType" className="flex items-center gap-2">
                <IconHome className="h-4 w-4" />
                Property Type
              </Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                <SelectTrigger className={errors.propertyType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {errors.propertyType}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <IconMapPin className="h-4 w-4" />
                Location
              </Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="loanAmount" className="flex items-center gap-2">
                <IconCurrencyDollar className="h-4 w-4" />
                Loan Amount
              </Label>
              <Input
                id="loanAmount"
                type="number"
                placeholder="0"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                className={errors.loanAmount ? 'border-red-500' : ''}
              />
              {formData.loanAmount && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(formData.loanAmount)}
                </p>
              )}
              {errors.loanAmount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {errors.loanAmount}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ltv" className="flex items-center gap-2">
                <IconPercentage className="h-4 w-4" />
                LTV (%)
              </Label>
              <Input
                id="ltv"
                type="number"
                placeholder="0"
                min="1"
                max="100"
                value={formData.ltv}
                onChange={(e) => handleInputChange('ltv', e.target.value)}
                className={errors.ltv ? 'border-red-500' : ''}
              />
              {errors.ltv && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {errors.ltv}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestPerc" className="flex items-center gap-2">
                <IconPercentage className="h-4 w-4" />
                Interest Rate (%)
              </Label>
              <Input
                id="interestPerc"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.interestPerc}
                onChange={(e) => handleInputChange('interestPerc', e.target.value)}
                className={errors.interestPerc ? 'border-red-500' : ''}
              />
              {errors.interestPerc && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {errors.interestPerc}
                </p>
              )}
            </div>
          </div>

          {/* Loan Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="loanDate" className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Loan Date
              </Label>
              <Input
                id="loanDate"
                type="date"
                value={formData.loanDate}
                onChange={(e) => handleInputChange('loanDate', e.target.value)}
                className={errors.loanDate ? 'border-red-500' : ''}
              />
              {errors.loanDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {errors.loanDate}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  borrower: '',
                  propertyType: '',
                  location: '',
                  loanAmount: '',
                  ltv: '',
                  interestPerc: '',
                  status: 'Pending',
                  loanDate: new Date().toISOString().split('T')[0]
                });
                setErrors({});
              }}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-gray-800"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 text-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  {/* <IconCheck className="h-4 w-4 mr-2 " /> */}
                  Create Loan
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 