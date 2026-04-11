import { render, screen } from '@testing-library/react';
import { TransactionTimeline, SuspiciousFlags } from './TransactionTimeline';
import { Transaction } from '@/lib/tx-classifier';

describe('TransactionTimeline', () => {
  const transactions: Transaction[] = [
    {
      hash: '0x1',
      timestamp: 1625097600, // June 30, 2021
      blockNumber: 1,
      isInternal: false,
      from: '0xabc',
      to: '0xdef',
      value: '1.5',
      category: 'transfer',
      suspiciousFlags: ['rapid_dispersal']
    },
    {
      hash: '0x2',
      timestamp: 1625097660,
      blockNumber: 2,
      isInternal: false,
      from: '0xdef',
      to: '0xghi',
      value: '2.0',
      category: 'swap',
      method: 'Swap Exact Tokens For Tokens',
      suspiciousFlags: []
    },
    {
        hash: '0x3',
        timestamp: 1625097720,
        blockNumber: 3,
        isInternal: false,
        from: '0xghi',
        to: '0xjkl',
        value: '5',
        category: 'mixer_interaction',
        suspiciousFlags: ['mixer_usage']
    },
    {
        hash: '0x4',
        timestamp: 1625097780,
        blockNumber: 4,
        isInternal: false,
        from: '0xjkl',
        to: '0xmno',
        value: '10',
        category: 'bridge',
        suspiciousFlags: []
    },
    {
        hash: '0x5',
        timestamp: 1625097840,
        blockNumber: 5,
        isInternal: false,
        from: '0xmno',
        to: '0xpqr',
        value: '0',
        category: 'unknown' as Transaction['category'],
        suspiciousFlags: []
    }
  ];

  it('renders nothing if no transactions are provided', () => {
    const { container } = render(<TransactionTimeline transactions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders transaction details and icons', () => {
    render(<TransactionTimeline transactions={transactions} />);
    
    expect(screen.getAllByText(/2021/).length).toBeGreaterThan(0);
    expect(screen.getByText('Swap Exact Tokens For Tokens')).toBeInTheDocument();
    expect(screen.getAllByText('1.5 ETH').length).toBeGreaterThan(0);
    expect(screen.getByText(/To: 0xdef/i)).toBeInTheDocument();
  });

  it('renders suspicious flags with correct formatting', () => {
    render(<TransactionTimeline transactions={transactions} />);
    
    expect(screen.getByText('Rapid Dispersal')).toBeInTheDocument();
    expect(screen.getByText('Mixer Usage')).toBeInTheDocument();
  });

  it('covers various transaction data combinations', () => {
    const mixedTxs: Transaction[] = [
      {
        ...transactions[0],
        hash: '0xMIXED',
        tokenValue: undefined,
        value: '10',
        tokenSymbol: undefined
      },
      {
        ...transactions[0],
        hash: '0xZERO',
        tokenValue: undefined,
        value: undefined,
        tokenSymbol: 'USDC'
      }
    ];
    render(<TransactionTimeline transactions={mixedTxs} />);
    expect(screen.getByText('10 ETH')).toBeInTheDocument();
    expect(screen.getByText('0 USDC')).toBeInTheDocument(); 
  });
});

describe('SuspiciousFlags Component', () => {
    it('renders null when there are no flags', () => {
        const { container } = render(<SuspiciousFlags flags={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders flags as chips', () => {
        render(<SuspiciousFlags flags={['flag_one', 'flag_two']} />);
        expect(screen.getByText('Flag One')).toBeInTheDocument();
        expect(screen.getByText('Flag Two')).toBeInTheDocument();
    });
});
