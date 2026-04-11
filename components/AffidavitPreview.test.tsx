import { render, screen } from '@testing-library/react';
import { AffidavitPreview } from './AffidavitPreview';

describe('AffidavitPreview', () => {
  it('renders "No Affidavit Generated" when pdfDataUrl is null', () => {
    render(<AffidavitPreview pdfDataUrl={null} />);
    
    expect(screen.getByText('No Affidavit Generated')).toBeInTheDocument();
    expect(screen.getByText(/Scan a wallet/i)).toBeInTheDocument();
  });

  it('renders iframe and download button when pdfDataUrl is provided', () => {
    const mockUrl = 'data:application/pdf;base64,mock';
    render(<AffidavitPreview pdfDataUrl={mockUrl} />);
    
    const iframe = screen.getByTitle('Affidavit Preview');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', `${mockUrl}#toolbar=0&navpanes=0&scrollbar=0`);
    
    const downloadLink = screen.getByRole('link', { name: /Download PDF/i });
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', mockUrl);
    expect(downloadLink).toHaveAttribute('download', 'affidavit_exhibit.pdf');
  });
});
