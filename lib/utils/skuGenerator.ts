export const generateSku = (prefix: string, counter: number): string => {
  // Example: prefix = 'ELEC', counter = 42 => 'ELEC-000042'
  const padded = String(counter).padStart(6, '0');
  return `${prefix.toUpperCase()}-${padded}`;
};
