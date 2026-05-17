import { render, screen } from '@testing-library/react';
import { ExhibitVerificationPanel } from './ExhibitVerificationPanel';
import { LegalSection } from '@/lib/pdf-generator';

describe('ExhibitVerificationPanel', () => {
  const sections: LegalSection[] = [
    {
      exhibitNumber: 'A',
      paragraphNumber: 1,
      legalProse: 'Funds were transferred.',
      txHashes: ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'],
      dateRange: 'Jan 2026',
    },
    {
      exhibitNumber: 'B',
      paragraphNumber: 2,
      legalProse: 'Mixer interaction detected.',
      txHashes: ['0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'],
      dateRange: 'Feb 2026',
    },
  ];

  it('renders null when sections is empty', () => {
    const { container } = render(<ExhibitVerificationPanel sections={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the verification header', () => {
    render(<ExhibitVerificationPanel sections={sections} />);
    expect(screen.getByText('Exhibit Verification')).toBeInTheDocument();
    expect(screen.getByText(/cross-referenced against the Ethereum/)).toBeInTheDocument();
  });

  it('renders each exhibit with number and date range', () => {
    render(<ExhibitVerificationPanel sections={sections} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('Feb 2026')).toBeInTheDocument();
  });

  it('renders Verified on-chain badges for each section', () => {
    render(<ExhibitVerificationPanel sections={sections} />);
    const badges = screen.getAllByText('Verified on-chain');
    expect(badges).toHaveLength(2);
  });

  it('renders Etherscan links with correct hrefs', () => {
    render(<ExhibitVerificationPanel sections={sections} />);
    const links = screen.getAllByLabelText('View on Etherscan');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    expect(links[1]).toHaveAttribute('href', 'https://etherscan.io/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
    expect(links[0]).toHaveAttribute('target', '_blank');
  });

  it('renders the footer disclaimer', () => {
    render(<ExhibitVerificationPanel sections={sections} />);
    expect(screen.getByText(/immutable identifiers/)).toBeInTheDocument();
    expect(screen.getByText('etherscan.io')).toBeInTheDocument();
  });
});
