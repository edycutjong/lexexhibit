import { render, screen, fireEvent } from '@testing-library/react';
import { FundFlowDiagram } from './FundFlowDiagram';
import { Transaction } from '@/lib/tx-classifier';

describe('FundFlowDiagram', () => {
  const transactions: Transaction[] = [
    {
      hash: '0x1',
      timestamp: 123456789,
      blockNumber: 1,
      isInternal: false,
      from: '0xOrigin',
      to: '0xMixer',
      value: '10',
      category: 'mixer_interaction',
      suspiciousFlags: ['mixer_usage']
    },
    {
      hash: '0x2',
      timestamp: 123456790,
      blockNumber: 2,
      isInternal: false,
      from: '0xMixer',
      to: '0xUnknown',
      value: '5',
      category: 'unknown',
      suspiciousFlags: []
    },
    {
      hash: '0x3',
      timestamp: 123456791,
      blockNumber: 3,
      isInternal: false,
      from: '0xMixer',
      to: '0xSwap',
      value: '5',
      category: 'swap',
      suspiciousFlags: []
    },
    {
      hash: '0x4',
      timestamp: 123456792,
      blockNumber: 4,
      isInternal: false,
      from: '0xSwap',
      to: '0xBridge',
      value: '5',
      category: 'bridge',
      suspiciousFlags: []
    }
  ];

  beforeEach(() => {
    Element.prototype.scrollTo = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('renders nothing if no transactions are provided', () => {
    const { container } = render(<FundFlowDiagram transactions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nodes and handles clicks', () => {
    render(<FundFlowDiagram transactions={transactions} />);
    
    expect(screen.getByText('Target Wallet')).toBeInTheDocument();
    expect(screen.getByText('Mixer (Tornado)')).toBeInTheDocument();
    expect(screen.getByText('Wallet')).toBeInTheDocument(); // category unknown default branch hit
    
    const node = screen.getByText('Mixer (Tornado)').closest('div');
    fireEvent.click(node!);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

    const originNode = screen.getByText('Target Wallet').closest('div');
    fireEvent.click(originNode!);
  });

  it('navigates with buttons', () => {
    render(<FundFlowDiagram transactions={transactions} />);
    
    const nextBtn = screen.getByLabelText('Next node');
    fireEvent.click(nextBtn);
    
    const prevBtn = screen.getByLabelText('Previous node');
    fireEvent.click(prevBtn);
    expect(prevBtn).toBeDisabled();
  });

  it('exercises ref assignment for 100% coverage', () => {
    render(<FundFlowDiagram transactions={transactions} />);
    const nodes = screen.getAllByTestId('diagram-node');
    expect(nodes.length).toBeGreaterThan(0);
  });
});
