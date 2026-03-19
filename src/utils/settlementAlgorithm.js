import { generateId } from './storage';

export function computeBalances(group) {
  // Initialize balances map
  const balances = {};
  group.members.forEach(m => {
    balances[m.id] = {
      memberId: m.id,
      paid: 0,
      owed: 0,
      net: 0
    };
  });

  // Calculate total paid and owed for each member
  group.expenses.forEach(exp => {
    if (balances[exp.paidBy]) {
      balances[exp.paidBy].paid += exp.amount;
    }

    Object.entries(exp.splits).forEach(([memberId, splitAmount]) => {
      if (balances[memberId]) {
        balances[memberId].owed += splitAmount;
      }
    });
  });

  // Calculate net
  Object.values(balances).forEach(b => {
    b.net = b.paid - b.owed;
  });

  return balances;
}

export function generateSettlements(group) {
  const balances = computeBalances(group);
  
  // Debtors = owe money (negative net)
  // Creditors = get money back (positive net)
  let debtors = Object.values(balances)
    .filter(b => b.net < -0.01)
    .sort((a, b) => a.net - b.net); // Most negative first
    
  let creditors = Object.values(balances)
    .filter(b => b.net > 0.01)
    .sort((a, b) => b.net - a.net); // Most positive first

  const settlements = [];

  // Greedy matching
  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(Math.abs(debtor.net), creditor.net);

    const debtorMember = group.members.find(m => m.id === debtor.memberId);
    let method = 'cash';
    if (debtorMember) {
      if (debtorMember.mode === 'upi') method = 'upi';
      if (debtorMember.mode === 'nophone') method = 'collect';
    }

    settlements.push({
      id: generateId(),
      fromId: debtor.memberId,
      toId: creditor.memberId,
      amount: Math.round(amount),
      method,
      status: 'pending'
    });

    debtor.net += amount;
    creditor.net -= amount;

    // Move pointers if balance becomes 0
    if (Math.abs(debtor.net) < 0.01) i++;
    if (creditor.net < 0.01) j++;
  }

  return settlements;
}
