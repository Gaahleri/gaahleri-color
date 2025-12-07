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
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp } from "lucide-react";

interface TopColor {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  buyLink: string | null;
  series: {
    name: string;
  };
  addCount: number;
}

interface TopColorsData {
  topColors: TopColor[];
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

export default function TopColorsStats() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  // 使用 SWR 进行数据缓存
  const { data, isLoading: loading } = useSWR<TopColorsData>(
    `/api/admin/stats/top-colors?year=${selectedYear}&month=${selectedMonth}&country=${selectedCountry}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 统计数据 60 秒内不重复请求
    }
  );

  const topColors = data?.topColors || [];

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 10 Most Saved Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
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
              <TrendingUp className="h-5 w-5" />
              Top 10 Most Saved Colors
            </CardTitle>
            <CardDescription>
              Most saved colors by users for selected month
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
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
        {topColors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No data available yet. Colors will appear here once users start
            saving them.
          </p>
        ) : (
          <div className="space-y-3">
            {topColors.map((color, index) => (
              <div
                key={color.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl font-bold text-muted-foreground w-8">
                  #{index + 1}
                </span>
                <div
                  className="w-12 h-12 rounded-md border shadow-sm shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{color.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {color.series?.name}
                    </Badge>
                    <span>{color.hex}</span>
                  </div>
                  {color.buyLink && (
                    <div className="text-xs text-muted-foreground truncate max-w-[300px] mt-1">
                      <span className="font-semibold">Link: </span>
                      <a
                        href={color.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {color.buyLink}
                      </a>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {color.addCount}
                  </div>
                  <div className="text-xs text-muted-foreground">saves</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
