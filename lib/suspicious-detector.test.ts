import { detectSuspiciousPatterns, SUSPICIOUS_FLAGS } from './suspicious-detector';
import { Transaction } from './tx-classifier';

describe('suspicious-detector', () => {
  const baseTx: Transaction = {
    hash: '0x1',
    from: '0xFROM',
    to: '0xTO',
    value: '1000',
    blockNumber: 1,
    timestamp: 1730000000,
    isInternal: false,
    category: 'transfer',
    suspiciousFlags: []
  };

  it('should flag mixer interactions', () => {
    const txs: Transaction[] = [
      { ...baseTx, category: 'mixer_interaction' }
    ];
    const results = detectSuspiciousPatterns(txs);
    expect(results[0].suspiciousFlags).toContain(SUSPICIOUS_FLAGS.MIXER_INTERACTION);
  });

  it('should flag high value transfers', () => {
    const txs: Transaction[] = [
      { ...baseTx, tokenValue: '200000' }
    ];
    const results = detectSuspiciousPatterns(txs);
    expect(results[0].suspiciousFlags).toContain(SUSPICIOUS_FLAGS.HIGH_VALUE_TRANSFER);
  });

  it('should flag rapid dispersal', () => {
    const txs: Transaction[] = [
      { ...baseTx, to: '0xWALLET_A', timestamp: 1730000000 },
      { ...baseTx, from: '0xWALLET_A', timestamp: 1730001800 } // +30 mins
    ];
    const results = detectSuspiciousPatterns(txs);
    expect(results[1].suspiciousFlags).toContain(SUSPICIOUS_FLAGS.RAPID_DISPERSAL);
  });

  it('should not flag dispersal if time difference is > 1 hour', () => {
    const txs: Transaction[] = [
      { ...baseTx, to: '0xWALLET_A', timestamp: 1730000000 },
      { ...baseTx, from: '0xWALLET_A', timestamp: 1730004000 } // +1 hour 6 mins
    ];
    const results = detectSuspiciousPatterns(txs);
    expect(results[1].suspiciousFlags).not.toContain(SUSPICIOUS_FLAGS.RAPID_DISPERSAL);
  });

  it('handles missing suspiciousFlags', () => {
    const tx = { ...baseTx };
    delete (tx as any).suspiciousFlags;
    const results = detectSuspiciousPatterns([tx]);
    expect(results[0].suspiciousFlags).toEqual([]);
  });

  it('should preserve pre-existing flags', () => {
    const txs: Transaction[] = [
      { ...baseTx, suspiciousFlags: ['MANUAL_REVIEW'] }
    ];
    const results = detectSuspiciousPatterns(txs);
    expect(results[0].suspiciousFlags).toContain('MANUAL_REVIEW');
  });
});
