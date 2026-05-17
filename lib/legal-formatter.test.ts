import { formatLegalDate, formatParty, formatValue, formatLegalProse } from './legal-formatter';

describe('legal-formatter', () => {
  describe('formatLegalDate', () => {
    it('should format a unix timestamp correctly', () => {
      // 1730419200 is November 1, 2024
      expect(formatLegalDate(1730419200)).toBe('On or about November 1, 2024');
    });
  });

  describe('formatParty', () => {
    it('should format defendant wallet correctly', () => {
      const result = formatParty('0x1234567890abcdef1234567890abcdef12345678', true);
      expect(result).toContain('Defendant wallet');
      expect(result).toContain('345678');
    });

    it('should format non-defendant wallet correctly', () => {
      const result = formatParty('0x1234567890abcdef1234567890abcdef12345678', false);
      expect(result).not.toContain('Defendant');
      expect(result).toContain('345678');
    });
  });

  describe('formatValue', () => {
    it('should format currency-like values with commas', () => {
      expect(formatValue('1234567.89', 'ETH')).toBe('1,234,567.89 ETH');
    });

    it('should default to ETH as symbol', () => {
      expect(formatValue('500')).toBe('500 ETH');
    });
  });

  describe('formatLegalProse', () => {
    const timestamp = 1730419200;
    const from = '0x111122223333444455556666777788889999AAAA';
    const to = '0xAAAABBBBCCCCDDDDEEEEFFFF0000111122223333';
    const value = '1000';
    const symbol = 'USDC';

    it('should handle "transfer" correctly', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'transfer', 'A-1');
      expect(prose).toContain('transmitted');
      expect(prose).toContain('Exhibit A-1');
    });

    it('should handle "swap" correctly', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'swapExactTokensForTokens', 'A-2');
      expect(prose).toContain('exchanged');
      expect(prose).toContain('Exhibit A-2');
    });

    it('should handle "bridge" correctly', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'bridgeTokens', 'A-3');
      expect(prose).toContain('bridge');
      expect(prose).toContain('Exhibit A-3');
    });

    it('should handle "deposit" correctly', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'deposit', 'A-4');
      expect(prose).toContain('deposited');
      expect(prose).toContain('Exhibit A-4');
    });

    it('should default to "asset movement" for unknown categories', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'unknown', 'A-5');
      expect(prose).toContain('asset movement');
    });

    it('should append mixer_interaction flag language', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'transfer', 'A-6', ['mixer_interaction']);
      expect(prose).toContain('Tornado Cash');
      expect(prose).toContain('OFAC');
    });

    it('should append rapid_dispersal flag language', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'transfer', 'A-7', ['rapid_dispersal']);
      expect(prose).toContain('rapid dispersal');
    });

    it('should append cross_chain_hop flag language', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'bridge', 'A-8', ['cross_chain_hop']);
      expect(prose).toContain('cross-chain');
    });

    it('should work with no flags (backward compatible)', () => {
      const prose = formatLegalProse(timestamp, from, to, value, symbol, 'transfer', 'A-9');
      expect(prose).toContain('Exhibit A-9');
      expect(prose).not.toContain('Tornado');
    });
  });
});
