export function currencyParser(value: string): string | undefined {
   const parsed = parseInt(value?.replace(/[^0-9]/g, ''));
   if (Number.isNaN(parsed)) return '0';
   return parsed.toString();
}

export function currencyFormatter(value: string | number | undefined): string {
   return `Gs. ${value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
