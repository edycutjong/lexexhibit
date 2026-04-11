import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('renders the main legal admissible headline', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Etherscan isn't/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/admissible/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/court/i);
  });

  it('renders the subtext description', () => {
    render(<Home />);
    expect(screen.getByText(/Translate complex DeFi wallet histories into beautifully formatted/i)).toBeInTheDocument();
  });

  it('renders the WalletInput component', () => {
    render(<Home />);
    // We can check for the placeholder in WalletInput
    expect(screen.getByPlaceholderText(/Search Ethereum wallet address/i)).toBeInTheDocument();
  });
});
