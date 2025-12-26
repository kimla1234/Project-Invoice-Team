// Helper function to format currency in Indian format
export const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Helper function to format date ranges
  export const getWeekLabel = (daysAgoStart: number, daysAgoEnd: number): string => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);
    
    startDate.setDate(today.getDate() - daysAgoStart);
    endDate.setDate(today.getDate() - daysAgoEnd);
    
    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }
    
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  
  // Get month names for charts
  export const getLast6Months = (): string[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - (5 - i) + 12) % 12;
      return monthNames[monthIndex];
    });
  };