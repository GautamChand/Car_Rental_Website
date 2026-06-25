/**
 * Format price with currency symbol
 */
export const formatPrice = (amount: number): string => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

/**
 * Format date to a readable string
 */
export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/**
 * Get a color class for booking status
 */
export const getBookingStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "#4caf50";
    case "inprogress":
      return "#ff9800";
    case "completed":
      return "#2196f3";
    case "cancelled":
      return "#f44336";
    default:
      return "#9e9e9e";
  }
};

/**
 * Get a color class for payment status
 */
export const getPaymentStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "#4caf50";
    case "pending":
      return "#ff9800";
    case "failed":
      return "#f44336";
    case "refunded":
      return "#9c27b0";
    default:
      return "#9e9e9e";
  }
};