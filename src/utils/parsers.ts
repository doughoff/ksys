export interface productOutput {
  quantity: number;
  cost: number;
  barcode: string;
}

export function parseProductInput(input: string): productOutput {
  let [rest, quantity, cost] = [input, 1, 0];

  const quantitySplit = input.split('*');
  if (quantitySplit.length === 2) {
    const [quantityString, restOfString] = quantitySplit;
    quantity = parseInt(quantityString ?? '0') || 1;
    rest = restOfString ?? '';
  } else if (quantitySplit.length > 2) {
    throw new Error(`Invalid QUANTITY on INPUT: ${input}`);
  }

  const costSplit = rest.split('=');
  if (costSplit && costSplit.length === 2) {
    const [costString, restOfString] = costSplit;
    cost = parseInt(costString ?? '0') ?? 0;
    rest = restOfString ?? '';
  } else if (costSplit.length > 2) {
    throw new Error(`Invalid COST on INPUT: ${input}`);
  }

  return {
    quantity,
    cost,
    barcode: rest,
  };
}
