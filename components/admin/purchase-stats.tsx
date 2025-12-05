"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, TrendingUp } from "lucide-react";

interface PurchaseColor {
  colorId: string;
  colorName: string;
  colorCode: string;
  hex: string;
  rgb: string;
  seriesId: string;
  seriesName: string;
  clickCount: number;
}

interface PurchaseStatsData {
  year: number;
  month: number;
  totalClicks: number;
  colors: PurchaseColor[];
  availableMonths: string[];
  availableCountries: string[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function PurchaseStats() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  const { data, isLoading, error } = useSWR<PurchaseStatsData>(
    `/api/admin/stats/purchases?year=${selectedYear}&month=${selectedMonth}&country=${selectedCountry}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Failed to load purchase statistics. Please try again later.
        </CardContent>
      </Card>
    );
  }

  // Generate month options for the last 12 months
  const monthOptions: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    monthOptions.push({
      value: `${year}-${month}`,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase Click Statistics
            </CardTitle>
            <CardDescription>
              Track how many times users click the buy button for each color
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {data?.availableCountries?.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={`${selectedYear}-${selectedMonth}`}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Card */}
        <div className="mb-6 p-4 rounded-lg bg-muted">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear} Summary
            </span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {data?.totalClicks || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            Total buy button clicks
          </div>
        </div>

        {/* Colors Table */}
        {data?.colors && data.colors.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead>Hex</TableHead>
                  <TableHead>RGB</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.colors.map((color, index) => (
                  <TableRow key={color.colorId}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border shadow-sm shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-medium">{color.colorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{color.seriesName}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {color.hex}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {color.rgb}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default" className="font-mono">
                        {color.clickCount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No purchase clicks recorded for this month.</p>
            <p className="text-sm mt-1">
              Data will appear here when users click buy buttons.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
