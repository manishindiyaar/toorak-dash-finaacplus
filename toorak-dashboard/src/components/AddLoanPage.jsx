import React from 'react';
import { AddLoanForm } from './AddLoanForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export function AddLoanPage({ onBack, onLoanAdded }) {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            {/* <h1 className="text-3xl font-bold">Add New Loan</h1>
            <p className="text-muted-foreground">Create a new loan application</p> */}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* <IconPlus className="h-5 w-5 text-primary" /> */}
          {/* <span className="text-sm font-medium">New Application</span> */}
        </div>
      </div>

      {/* Form Section */}
      <AddLoanForm onLoanAdded={onLoanAdded} />

     
  
    </div>
  );
} 