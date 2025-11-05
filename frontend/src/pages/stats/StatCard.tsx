// src/components/stats/StatCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import * as React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType; // We'll pass in a Lucide icon component
  isLoading: boolean;
}

export function StatCard({ title, value, icon: Icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Show skeleton placeholders while data is loading
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          // Animate the value in when it loads
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-4xl font-bold text-primary">{value}</div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}