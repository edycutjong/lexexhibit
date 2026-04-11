import { classifyTransaction } from './tx-classifier';

describe('tx-classifier', () => {
  it('should classify "swap" methods correctly', () => {
    expect(classifyTransaction({ method: 'swapExactTokensForTokens' })).toBe('swap');
    expect(classifyTransaction({ method: 'SwapETHForTokens' })).toBe('swap');
  });

  it('should classify liquidity deposit methods correctly', () => {
    expect(classifyTransaction({ method: 'addLiquidity' })).toBe('lp_deposit');
    expect(classifyTransaction({ method: 'deposit' })).toBe('lp_deposit');
  });

  it('should classify liquidity withdrawal methods correctly', () => {
    expect(classifyTransaction({ method: 'removeLiquidity' })).toBe('lp_withdraw');
    expect(classifyTransaction({ method: 'withdraw' })).toBe('lp_withdraw');
  });

  it('should classify bridge methods correctly', () => {
    expect(classifyTransaction({ method: 'bridgeTokens' })).toBe('bridge');
    expect(classifyTransaction({ method: 'across_transfer' })).toBe('bridge');
  });

  it('should classify mixer interactions correctly', () => {
    expect(classifyTransaction({ method: 'tornadoClaim' })).toBe('mixer_interaction');
    expect(classifyTransaction({ method: 'mix' })).toBe('mixer_interaction');
  });

  it('should classify standard transfers correctly', () => {
    expect(classifyTransaction({ method: 'transfer' })).toBe('transfer');
    expect(classifyTransaction({ method: 'transferFrom' })).toBe('transfer');
    expect(classifyTransaction({ method: undefined })).toBe('transfer');
  });

  it('should return "contract_call" for unknown methods', () => {
    expect(classifyTransaction({ method: 'executeSomething' })).toBe('contract_call');
  });
});
