import { Transaction } from './tx-classifier';

export const SUSPICIOUS_FLAGS = {
  RAPID_DISPERSAL: 'rapid_dispersal',
  MIXER_INTERACTION: 'mixer_interaction',
  CROSS_CHAIN_HOP: 'cross_chain_hop',
  HIGH_VALUE_TRANSFER: 'high_value_transfer',
};

export function detectSuspiciousPatterns(transactions: Transaction[]): Transaction[] {
  return transactions.map((tx, index) => {
    const flags = new Set<string>(tx.suspiciousFlags || []);

    // Mixer usage
    if (tx.category === 'mixer_interaction' || tx.to.toLowerCase().includes('tornado')) {
      flags.add(SUSPICIOUS_FLAGS.MIXER_INTERACTION);
    }

    // Bridge usage (often used to obscure trail)
    if (tx.category === 'bridge') {
      flags.add(SUSPICIOUS_FLAGS.CROSS_CHAIN_HOP);
    }

    // High value transfer (e.g. > 100k USD approximation)
    // We do a naive check for the demo, e.g. tokenValue > 100000 
    if (tx.tokenValue && parseFloat(tx.tokenValue) > 100000) {
      flags.add(SUSPICIOUS_FLAGS.HIGH_VALUE_TRANSFER);
    }
    
    // Rapid dispersal: if within 1 hour of the previous transaction 
    // there's another transfer out of this wallet
    if (index > 0 && tx.from === transactions[index-1].to) {
      const timeDiff = tx.timestamp - transactions[index-1].timestamp;
      if (timeDiff < 3600) {
         flags.add(SUSPICIOUS_FLAGS.RAPID_DISPERSAL);
      }
    }

    return {
      ...tx,
      suspiciousFlags: Array.from(flags),
    };
  });
}
