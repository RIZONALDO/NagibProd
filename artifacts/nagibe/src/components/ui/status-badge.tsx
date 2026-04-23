import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  EQUIPMENT_STATUS_LABELS,
  SHOOT_STATUS_COLORS,
  SHOOT_STATUS_LABELS,
  SHOOT_PRIORITY_COLORS,
  SHOOT_PRIORITY_LABELS
} from "@/lib/constants"
import { CheckCircle2, TriangleAlert } from "lucide-react"
import { differenceInCalendarDays, parseISO } from "date-fns"

export function EquipmentStatusBadge({ status, className }: { status: string, className?: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let customClass = "";
  
  switch(status) {
    case "available":
      customClass = "bg-green-500 hover:bg-green-600 text-white";
      break;
    case "reserved":
      customClass = "bg-yellow-500 hover:bg-yellow-600 text-white";
      break;
    case "in_use":
      customClass = "bg-blue-500 hover:bg-blue-600 text-white";
      break;
    case "maintenance":
      customClass = "bg-orange-500 hover:bg-orange-600 text-white";
      break;
    case "damaged":
      variant = "destructive";
      break;
    case "pending_return":
      customClass = "bg-amber-500 hover:bg-amber-600 text-white";
      break;
    default:
      variant = "secondary";
  }

  return (
    <Badge variant={variant} className={cn(customClass, className)}>
      {EQUIPMENT_STATUS_LABELS[status] || status}
    </Badge>
  )
}

export function ShootStatusBadge({ status, className }: { status: string, className?: string }) {
  const colorClass = SHOOT_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  
  return (
    <Badge variant="outline" className={cn("border-transparent gap-1", colorClass, className)}>
      {status === "closed" && <CheckCircle2 className="h-3 w-3" />}
      {SHOOT_STATUS_LABELS[status] || status}
    </Badge>
  )
}

export function ShootPriorityBadge({ priority, className }: { priority: string, className?: string }) {
  const colorClass = SHOOT_PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-800";
  
  return (
    <Badge variant="outline" className={cn(colorClass, className)}>
      {SHOOT_PRIORITY_LABELS[priority] || priority}
    </Badge>
  )
}

/** Returns true if the shoot is not closed but its last day passed more than 1 day ago */
export function isShootOverdue(shoot: { status: string; date: string; endDate?: string | null }): boolean {
  if (shoot.status === "closed") return false;
  const referenceDate = shoot.endDate ?? shoot.date;
  try {
    const diff = differenceInCalendarDays(new Date(), parseISO(referenceDate));
    return diff > 1;
  } catch {
    return false;
  }
}

export function ShootOverdueBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent gap-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        className
      )}
    >
      <TriangleAlert className="h-3 w-3" />
      Atenção
    </Badge>
  )
}
