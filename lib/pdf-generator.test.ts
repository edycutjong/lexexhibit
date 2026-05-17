import { generateAffidavitPdfBase64, LegalSection } from './pdf-generator';
import { Transaction } from './tx-classifier';

describe('pdf-generator', () => {
  const sections: LegalSection[] = [
    {
      exhibitNumber: 'A',
      paragraphNumber: 1,
      legalProse: 'The defendant did something.',
      txHashes: ['0x123'],
      dateRange: 'Nov 2024'
    }
  ];

  const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
    hash: '0x' + 'a'.repeat(64),
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdef1234567890abcdef1234567890abcdef12',
    value: '1.5',
    category: 'transfer',
    blockNumber: 1000,
    timestamp: 1700000000,
    isInternal: false,
    suspiciousFlags: [],
    ...overrides,
  });

  it('generates a PDF data URL', async () => {
    const result = await generateAffidavitPdfBase64(sections);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('handles many sections and footer page break', async () => {
    const mediumCount = Array(12).fill(sections[0]);
    const result = await generateAffidavitPdfBase64(mediumCount);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('handles extremely many sections for multiple page breaks', async () => {
    const manySections = Array(40).fill(sections[0]);
    const result = await generateAffidavitPdfBase64(manySections);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('handles large text for splitTextToSize coverage', async () => {
    const longProse = 'long text '.repeat(600);
    const result = await generateAffidavitPdfBase64([{ ...sections[0], legalProse: longProse }]);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('renders fund flow page with transactions', async () => {
    const categories: Transaction['category'][] = ['mixer_interaction', 'swap', 'bridge', 'transfer'];
    const txs = categories.map((cat, i) => makeTx({
      hash: `0x${i.toString().padStart(64, 'a')}`,
      category: cat,
      blockNumber: 1000 + i,
    }));
    const result = await generateAffidavitPdfBase64(sections, txs);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('renders overflow text when >5 transactions', async () => {
    const txs = Array.from({ length: 8 }, (_, i) => makeTx({
      hash: `0x${i.toString().padStart(64, 'b')}`,
      blockNumber: 2000 + i,
      value: '0.25',
    }));
    const result = await generateAffidavitPdfBase64(sections, txs);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('handles short from address without truncation', async () => {
    const txs = [makeTx({
      hash: '0x' + 'c'.repeat(64),
      from: '0xshort',
      to: '0xdest1234',
      blockNumber: 3000,
    })];
    const result = await generateAffidavitPdfBase64(sections, txs);
    expect(result).toContain('data:application/pdf;base64,');
  });
});
