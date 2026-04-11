import { generateAffidavitPdfBase64, LegalSection } from './pdf-generator';

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

  it('generates a PDF data URL', async () => {
    const result = await generateAffidavitPdfBase64(sections);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('handles many sections and footer page break', async () => {
    // Each section is roughly 0.5 inches (prose + gap)
    // cursorY starts at 5.0. 
    // To reach > 9.5 we need ~10 sections
    // To trigger the footer page break specifically at line 70, we need it to end just before the bottom.
    const mediumCount = Array(12).fill(sections[0]);
    const result = await generateAffidavitPdfBase64(mediumCount);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('handles extremely many sections for multiple page breaks', async () => {
    // 40 sections will definitely trigger multiple pages
    const manySections = Array(40).fill(sections[0]);
    const result = await generateAffidavitPdfBase64(manySections);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('handles large text for splitTextToSize coverage', async () => {
    const longProse = 'long text '.repeat(600); // Very long text to trigger internal splitting logic
    const result = await generateAffidavitPdfBase64([{ ...sections[0], legalProse: longProse }]);
    expect(result).toContain('data:application/pdf;base64,');
  });
});
