"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive pie chart showing loan distribution by status"

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

interface ChartDataItem {
  name: string;
  value: number;
  count: number;
  percentage: number;
  color: string;
}

const chartConfig = {
  loanAmount: {
    label: "Loan Amount",
  },
  funded: {
    label: "Funded",
    color: "#10b981",
  },
  approved: {
    label: "Approved", 
    color: "#3b82f6",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  declined: {
    label: "Declined",
    color: "#ef4444",
  },
  allPaid: {
    label: "All Paid",
    color: "#8b5cf6",
  },
} satisfies ChartConfig

const STATUS_COLORS = {
  'Funded': '#10b981',
  'Approved': '#3b82f6', 
  'Pending': '#f59e0b',
  'Declined': '#ef4444',
  'All Paid': '#8b5cf6'
};

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [viewType, setViewType] = React.useState<"amount" | "count">("amount")
  const [chartData, setChartData] = React.useState<ChartDataItem[]>([])
  const [totalAmount, setTotalAmount] = React.useState<number>(0)
  const [totalCount, setTotalCount] = React.useState<number>(0)

  React.useEffect(() => {
    fetchLoanData()
  }, [])

  const fetchLoanData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/loans')
      const loans: LoanData[] = await response.json()
      
      // Group loans by status
      const statusGroups: Record<string, { amount: number; count: number }> = {}
      let total = 0
      
      loans.forEach((loan) => {
        const status = loan.status
        if (!statusGroups[status]) {
          statusGroups[status] = { amount: 0, count: 0 }
        }
        statusGroups[status].amount += loan.loanAmount
        statusGroups[status].count += 1
        total += loan.loanAmount
      })
      
      // Convert to chart data
      const chartArray: ChartDataItem[] = Object.entries(statusGroups).map(([status, data]) => ({
        name: status,
        value: data.amount,
        count: data.count,
        percentage: Math.round((data.amount / total) * 100),
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
      }))
      
      setChartData(chartArray)
      setTotalAmount(total)
      setTotalCount(loans.length)
    } catch (error) {
      console.error('Error fetching loan data:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            Amount: {formatCurrency(data.value)}
          </p>
          <p className="text-sm">
            Count: {data.count} loans
          </p>
          <p className="text-sm">
            Percentage: {data.percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    )
  }

  const currentData = viewType === "amount" ? chartData : chartData.map(item => ({
    ...item,
    value: item.count
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Loan Portfolio Distribution</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Distribution of loans by status - {viewType === "amount" ? "by amount" : "by count"}
          </span>
          <span className="@[540px]/card:hidden">Loan distribution</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={viewType}
            onValueChange={(value) => setViewType(value as "amount" | "count")}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="amount">By Amount</ToggleGroupItem>
            <ToggleGroupItem value="count">By Count</ToggleGroupItem>
          </ToggleGroup>
          <Select value={viewType} onValueChange={(value) => setViewType(value as "amount" | "count")}>
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select view type"
            >
              <SelectValue placeholder="By Amount" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="amount" className="rounded-lg">
                By Amount
              </SelectItem>
              <SelectItem value="count" className="rounded-lg">
                By Count
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total Portfolio</p>
              <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total Loans</p>
              <p className="text-lg font-semibold">{totalCount}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value} ({viewType === "amount" 
                        ? formatCurrency((entry.payload as ChartDataItem).value)
                        : `${(entry.payload as ChartDataItem).count} loans`
                      })
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Status Breakdown</h4>
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <div className="text-right">
                  <div>{formatCurrency(item.value)}</div>
                  <div className="text-xs text-gray-500">{item.count} loans</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
