"use client";

import { useState, useMemo } from "react";
import { UserData, useUserData } from "../../hooks/use-user-data";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowUpDown,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "../ui/Button";

interface TransactionsClientProps {
  initialData: UserData;
}

export function TransactionsClient({ initialData }: TransactionsClientProps) {
  const { data } = useUserData(initialData);
  const transactions = data?.transactions || [];

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("NEWEST");

  // Derive filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search Filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          tx.id.toLowerCase().includes(searchLower) ||
          tx.amount.toString().includes(searchLower) ||
          tx.type.toLowerCase().includes(searchLower) ||
          (tx.currency && tx.currency.toLowerCase().includes(searchLower)) ||
          (tx.txHash && tx.txHash.toLowerCase().includes(searchLower));

        // Type Filter
        const matchesType = typeFilter === "ALL" || tx.type === typeFilter;

        // Status Filter
        const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        switch (sortOrder) {
          case "NEWEST":
            return dateB - dateA;
          case "OLDEST":
            return dateA - dateB;
          case "HIGHEST":
            return b.amount - a.amount;
          case "LOWEST":
            return a.amount - b.amount;
          default:
            return dateB - dateA;
        }
      });
  }, [transactions, searchQuery, typeFilter, statusFilter, sortOrder]);

  // Unique types for filter dropdown
  const transactionTypes = ["ALL", ...Array.from(new Set(transactions.map(tx => tx.type)))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage and track all your financial activities.</p>
        </div>
        
        <Button 
          variant="outline" 
          className="gap-2 w-full md:w-auto"
          onClick={() => {
            // CSV Export Logic
            const headers = ["ID", "Type", "Amount", "Currency", "Status", "Date", "Transaction Hash"];
            const csvContent = [
              headers.join(","),
              ...filteredTransactions.map(tx => [
                tx.id,
                tx.type,
                tx.amount,
                tx.currency,
                tx.status,
                new Date(tx.createdAt).toISOString(),
                tx.txHash || ""
              ].join(","))
            ].join("\n");
            
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID, Amount, Type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap gap-2 lg:gap-4">
            {/* Type Filter */}
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {transactionTypes.map(type => (
                <option key={type} value={type}>
                  {type === "ALL" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Sort Order */}
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST">Highest Amount</option>
              <option value="LOWEST">Lowest Amount</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
           <Card className="p-12 flex flex-col items-center justify-center text-center space-y-3">
             <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
               <Search className="h-6 w-6 text-muted-foreground" />
             </div>
             <div>
               <p className="text-lg font-semibold">No transactions found</p>
               <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
             </div>
           </Card>
        ) : (
          filteredTransactions.map((tx) => (
            <Card key={tx.id} className="p-4 hover:shadow-md transition-all hover:bg-muted/50 border-border/50">
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Left Side: Icon & Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-3 rounded-full shrink-0 ${
                    tx.type === 'DEPOSIT' 
                      ? 'bg-green-500/10 text-green-500' 
                      : tx.type === 'WITHDRAWAL' 
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="h-5 w-5" /> : 
                     tx.type === 'WITHDRAWAL' ? <ArrowUpRight className="h-5 w-5" /> : 
                     <ArrowUpDown className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1).toLowerCase()}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                        tx.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600 dark:text-green-500' :
                        tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' :
                        'bg-red-500/10 text-red-600 dark:text-red-500'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      
                      {tx.txHash && (
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit max-w-full">
                           <span className="font-bold opacity-70">Ref:</span>
                           <span className="font-mono truncate select-all" title={tx.txHash}>
                             {tx.txHash}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Amount */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pl-14 md:pl-0">
                  <div className="text-right ml-auto md:ml-0">
                    <p className={`text-lg font-bold whitespace-nowrap ${
                      tx.type === 'DEPOSIT' ? 'text-green-500' : 'text-foreground'
                    }`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {tx.currency && (
                      <p className="text-xs text-muted-foreground font-medium">{tx.currency}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
