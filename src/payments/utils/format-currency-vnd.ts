export function formatCurrencyVND(amount: string | number) {
  // Convert the string to a number
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }

  if (isNaN(amount)) {
    throw new Error('Invalid number format');
  }

  // Format the number as VND currency
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
