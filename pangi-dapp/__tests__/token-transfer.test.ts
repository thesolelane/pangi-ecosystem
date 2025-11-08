/**
 * Token Transfer with Tax Tests
 * 
 * Comprehensive tests for PANGI token transfers with dynamic tax rates.
 * Tests all transfer types: P2P, Exchange, Whale, and Reward transfers.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  calculateTax,
  getTaxRate,
  getTransferType,
  pangiToLamports,
  lamportsToPangi,
  formatPangi,
} from './helpers/test-utils';

describe('Token Transfer with Tax', () => {
  const idlPath = path.join(__dirname, '../../target/idl/pangi_token.json');
  const tokenIdl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

  describe('Transfer Instruction Validation', () => {
    test('should validate transfer_with_tax instruction', () => {
      const instruction = tokenIdl.instructions.find(
        (i: any) => i.name === 'transfer_with_tax'
      );
      
      expect(instruction).toBeDefined();
      expect(instruction.accounts).toHaveLength(6);
      expect(instruction.args).toHaveLength(1);
      expect(instruction.args[0].name).toBe('amount');
      expect(instruction.args[0].type).toBe('u64');
    });

    test('should validate required accounts', () => {
      const instruction = tokenIdl.instructions.find(
        (i: any) => i.name === 'transfer_with_tax'
      );
      
      const accountNames = instruction.accounts.map((a: any) => a.name);
      expect(accountNames).toContain('from');
      expect(accountNames).toContain('to');
      expect(accountNames).toContain('conservationFund');
      expect(accountNames).toContain('authority');
      expect(accountNames).toContain('tokenProgram');
      expect(accountNames).toContain('taxConfig');
    });

    test('should validate TaxConfig account structure', () => {
      const taxConfig = tokenIdl.accounts.find((a: any) => a.name === 'TaxConfig');
      
      expect(taxConfig).toBeDefined();
      
      const fieldNames = taxConfig.type.fields.map((f: any) => f.name);
      expect(fieldNames).toContain('p2pTaxRate');
      expect(fieldNames).toContain('exchangeTaxRate');
      expect(fieldNames).toContain('whaleTaxRate');
      expect(fieldNames).toContain('whaleTransferThreshold');
      expect(fieldNames).toContain('conservationFund');
    });
  });

  describe('P2P Transfer (1% Tax)', () => {
    const taxRate = 100; // 1% = 100 basis points

    test('should calculate tax for 1000 PANGI transfer', () => {
      const amount = 1000;
      const tax = calculateTax(amount, taxRate);
      const netAmount = amount - tax;
      
      expect(tax).toBe(10); // 1% of 1000
      expect(netAmount).toBe(990);
    });

    test('should calculate tax for 5000 PANGI transfer', () => {
      const amount = 5000;
      const tax = calculateTax(amount, taxRate);
      const netAmount = amount - tax;
      
      expect(tax).toBe(50); // 1% of 5000
      expect(netAmount).toBe(4950);
    });

    test('should calculate tax for 100,000 PANGI transfer', () => {
      const amount = 100_000;
      const tax = calculateTax(amount, taxRate);
      const netAmount = amount - tax;
      
      expect(tax).toBe(1000); // 1% of 100,000
      expect(netAmount).toBe(99_000);
    });

    test('should simulate P2P transfer workflow', () => {
      const sender = {
        balance: 10_000,
        address: 'SenderAccount123',
      };
      
      const recipient = {
        balance: 0,
        address: 'RecipientAccount456',
      };
      
      const conservationFund = {
        balance: 0,
        address: 'ConservationFund789',
      };
      
      // Transfer 1000 PANGI
      const transferAmount = 1000;
      const tax = calculateTax(transferAmount, taxRate);
      const netAmount = transferAmount - tax;
      
      // Update balances
      sender.balance -= transferAmount;
      recipient.balance += netAmount;
      conservationFund.balance += tax;
      
      expect(sender.balance).toBe(9_000);
      expect(recipient.balance).toBe(990);
      expect(conservationFund.balance).toBe(10);
    });
  });

  describe('Exchange Deposit (0.5% Tax)', () => {
    const taxRate = 50; // 0.5% = 50 basis points

    test('should calculate tax for 10,000 PANGI deposit', () => {
      const amount = 10_000;
      const tax = calculateTax(amount, taxRate);
      const netAmount = amount - tax;
      
      expect(tax).toBe(50); // 0.5% of 10,000
      expect(netAmount).toBe(9_950);
    });

    test('should calculate tax for 100,000 PANGI deposit', () => {
      const amount = 100_000;
      const tax = calculateTax(amount, taxRate);
      const netAmount = amount - tax;
      
      expect(tax).toBe(500); // 0.5% of 100,000
      expect(netAmount).toBe(99_500);
    });

    test('should simulate exchange deposit workflow', () => {
      const user = {
        balance: 50_000,
        address: 'UserAccount123',
      };
      
      const exchange = {
        balance: 0,
        address: 'ExchangeAccount456',
      };
      
      const conservationFund = {
        balance: 0,
        address: 'ConservationFund789',
      };
      
      // Deposit 20,000 PANGI to exchange
      const depositAmount = 20_000;
      const tax = calculateTax(depositAmount, taxRate);
      const netAmount = depositAmount - tax;
      
      // Update balances
      user.balance -= depositAmount;
      exchange.balance += netAmount;
      conservationFund.balance += tax;
      
      expect(user.balance).toBe(30_000);
      expect(exchange.balance).toBe(19_900);
      expect(conservationFund.balance).toBe(100);
    });
  });

  describe('Whale Transfer (2% Tax)', () => {
    const taxRate = 200; // 2% = 200 basis points
    const whaleThreshold = 10_000_000;

    test('should calculate tax for 15M PANGI transfer', () => {
      const amount = 15_000_000;
      const tax = calculateTax(amount, taxRate);
      const netAmount = amount - tax;
      
      expect(tax).toBe(300_000); // 2% of 15M
      expect(netAmount).toBe(14_700_000);
    });

    test('should calculate tax for 50M PANGI transfer', () => {
      const amount = 50_000_000;
      const tax = calculateTax(amount, taxRate);
      const netAmount = amount - tax;
      
      expect(tax).toBe(1_000_000); // 2% of 50M
      expect(netAmount).toBe(49_000_000);
    });

    test('should determine whale transfer type', () => {
      const amount = 15_000_000;
      const transferType = getTransferType(amount, whaleThreshold, false, false);
      
      expect(transferType).toBe('LargeWhale');
      expect(amount).toBeGreaterThan(whaleThreshold);
    });

    test('should simulate whale transfer workflow', () => {
      const whale = {
        balance: 100_000_000,
        address: 'WhaleAccount123',
      };
      
      const recipient = {
        balance: 0,
        address: 'RecipientAccount456',
      };
      
      const conservationFund = {
        balance: 0,
        address: 'ConservationFund789',
      };
      
      // Transfer 20M PANGI
      const transferAmount = 20_000_000;
      const tax = calculateTax(transferAmount, taxRate);
      const netAmount = transferAmount - tax;
      
      // Update balances
      whale.balance -= transferAmount;
      recipient.balance += netAmount;
      conservationFund.balance += tax;
      
      expect(whale.balance).toBe(80_000_000);
      expect(recipient.balance).toBe(19_600_000);
      expect(conservationFund.balance).toBe(400_000);
    });
  });

  describe('Conservation Reward (0% Tax)', () => {
    const taxRate = 0; // 0% = 0 basis points

    test('should calculate no tax for reward transfer', () => {
      const amount = 5_000;
      const tax = calculateTax(amount, taxRate);
      const netAmount = amount - tax;
      
      expect(tax).toBe(0);
      expect(netAmount).toBe(5_000);
    });

    test('should determine reward transfer type', () => {
      const amount = 5_000;
      const transferType = getTransferType(amount, 10_000_000, false, true);
      
      expect(transferType).toBe('ConservationReward');
    });

    test('should simulate reward distribution workflow', () => {
      const conservationFund = {
        balance: 100_000,
        address: 'ConservationFund789',
      };
      
      const recipient = {
        balance: 0,
        address: 'RecipientAccount456',
      };
      
      // Distribute 5,000 PANGI reward
      const rewardAmount = 5_000;
      const tax = calculateTax(rewardAmount, taxRate);
      const netAmount = rewardAmount - tax;
      
      // Update balances (no tax on rewards)
      conservationFund.balance -= rewardAmount;
      recipient.balance += netAmount;
      
      expect(conservationFund.balance).toBe(95_000);
      expect(recipient.balance).toBe(5_000);
      expect(tax).toBe(0);
    });
  });

  describe('Transfer Type Determination', () => {
    const whaleThreshold = 10_000_000;

    test('should identify P2P transfer', () => {
      const amount = 5_000;
      const type = getTransferType(amount, whaleThreshold, false, false);
      
      expect(type).toBe('PeerToPeer');
      expect(getTaxRate(type)).toBe(100); // 1%
    });

    test('should identify exchange deposit', () => {
      const amount = 50_000;
      const type = getTransferType(amount, whaleThreshold, true, false);
      
      expect(type).toBe('ExchangeDeposit');
      expect(getTaxRate(type)).toBe(50); // 0.5%
    });

    test('should identify whale transfer', () => {
      const amount = 15_000_000;
      const type = getTransferType(amount, whaleThreshold, false, false);
      
      expect(type).toBe('LargeWhale');
      expect(getTaxRate(type)).toBe(200); // 2%
    });

    test('should identify reward transfer', () => {
      const amount = 1_000;
      const type = getTransferType(amount, whaleThreshold, false, true);
      
      expect(type).toBe('ConservationReward');
      expect(getTaxRate(type)).toBe(0); // 0%
    });

    test('should prioritize reward over whale', () => {
      const amount = 20_000_000; // Above whale threshold
      const type = getTransferType(amount, whaleThreshold, false, true);
      
      expect(type).toBe('ConservationReward'); // Reward takes priority
      expect(getTaxRate(type)).toBe(0);
    });
  });

  describe('Amount Conversions', () => {
    test('should convert PANGI to lamports', () => {
      const conversions = [
        { pangi: 1, lamports: 1_000_000_000 },
        { pangi: 10, lamports: 10_000_000_000 },
        { pangi: 100, lamports: 100_000_000_000 },
        { pangi: 1000, lamports: 1_000_000_000_000 },
      ];
      
      conversions.forEach(({ pangi, lamports }) => {
        expect(pangiToLamports(pangi)).toBe(lamports);
      });
    });

    test('should convert lamports to PANGI', () => {
      const conversions = [
        { lamports: 1_000_000_000, pangi: 1 },
        { lamports: 10_000_000_000, pangi: 10 },
        { lamports: 100_000_000_000, pangi: 100 },
        { lamports: 1_000_000_000_000, pangi: 1000 },
      ];
      
      conversions.forEach(({ lamports, pangi }) => {
        expect(lamportsToPangi(lamports)).toBe(pangi);
      });
    });

    test('should format PANGI amounts for display', () => {
      expect(formatPangi(1000)).toBe('1,000.00');
      expect(formatPangi(1000000)).toBe('1,000,000.00');
      expect(formatPangi(1234.56)).toBe('1,234.56');
    });
  });

  describe('Multiple Transfer Scenarios', () => {
    test('Scenario 1: User makes multiple P2P transfers', () => {
      const user = {
        balance: 10_000,
        transferHistory: [] as any[],
      };
      
      const conservationFund = {
        balance: 0,
      };
      
      const transfers = [
        { recipient: 'Alice', amount: 1_000 },
        { recipient: 'Bob', amount: 2_000 },
        { recipient: 'Charlie', amount: 500 },
      ];
      
      transfers.forEach(({ recipient, amount }) => {
        const tax = calculateTax(amount, 100); // 1% P2P
        const netAmount = amount - tax;
        
        user.balance -= amount;
        conservationFund.balance += tax;
        
        user.transferHistory.push({
          recipient,
          amount,
          tax,
          netAmount,
          type: 'P2P',
        });
      });
      
      expect(user.balance).toBe(6_500);
      expect(conservationFund.balance).toBe(35); // 10 + 20 + 5
      expect(user.transferHistory).toHaveLength(3);
    });

    test('Scenario 2: Mixed transfer types', () => {
      const user = {
        balance: 100_000_000,
      };
      
      const conservationFund = {
        balance: 0,
      };
      
      // P2P transfer: 1,000 PANGI (1% tax)
      const p2pAmount = 1_000;
      const p2pTax = calculateTax(p2pAmount, 100);
      user.balance -= p2pAmount;
      conservationFund.balance += p2pTax;
      
      // Exchange deposit: 50,000 PANGI (0.5% tax)
      const exchangeAmount = 50_000;
      const exchangeTax = calculateTax(exchangeAmount, 50);
      user.balance -= exchangeAmount;
      conservationFund.balance += exchangeTax;
      
      // Whale transfer: 20M PANGI (2% tax)
      const whaleAmount = 20_000_000;
      const whaleTax = calculateTax(whaleAmount, 200);
      user.balance -= whaleAmount;
      conservationFund.balance += whaleTax;
      
      expect(user.balance).toBe(79_949_000);
      expect(conservationFund.balance).toBe(400_260); // 10 + 250 + 400,000
    });

    test('Scenario 3: Daily trading volume impact', () => {
      const dailyVolume = 1_000_000_000; // 1B PANGI
      
      // Assume 70% P2P, 20% Exchange, 10% Whale
      const p2pVolume = dailyVolume * 0.7;
      const exchangeVolume = dailyVolume * 0.2;
      const whaleVolume = dailyVolume * 0.1;
      
      const p2pTax = calculateTax(p2pVolume, 100); // 1%
      const exchangeTax = calculateTax(exchangeVolume, 50); // 0.5%
      const whaleTax = calculateTax(whaleVolume, 200); // 2%
      
      const totalTax = p2pTax + exchangeTax + whaleTax;
      
      expect(totalTax).toBe(10_000_000); // 10M PANGI per day
      expect(p2pTax).toBe(7_000_000);
      expect(exchangeTax).toBe(1_000_000);
      expect(whaleTax).toBe(2_000_000);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero amount transfer', () => {
      const amount = 0;
      const tax = calculateTax(amount, 100);
      
      expect(tax).toBe(0);
    });

    test('should handle very small amounts', () => {
      const amount = 1;
      const tax = calculateTax(amount, 100); // 1% of 1
      
      expect(tax).toBe(0); // Rounds down to 0
    });

    test('should handle amounts at whale threshold', () => {
      const whaleThreshold = 10_000_000;
      
      // Just below threshold
      const belowThreshold = 9_999_999;
      const typeBelow = getTransferType(belowThreshold, whaleThreshold, false, false);
      expect(typeBelow).toBe('PeerToPeer');
      
      // At threshold
      const atThreshold = 10_000_000;
      const typeAt = getTransferType(atThreshold, whaleThreshold, false, false);
      expect(typeAt).toBe('PeerToPeer');
      
      // Above threshold
      const aboveThreshold = 10_000_001;
      const typeAbove = getTransferType(aboveThreshold, whaleThreshold, false, false);
      expect(typeAbove).toBe('LargeWhale');
    });

    test('should handle maximum safe integer', () => {
      const maxAmount = Number.MAX_SAFE_INTEGER;
      const tax = calculateTax(maxAmount, 100);
      
      expect(tax).toBeGreaterThan(0);
      expect(tax).toBeLessThan(maxAmount);
    });
  });

  describe('Tax Revenue Projections', () => {
    test('should calculate annual tax revenue (conservative)', () => {
      const dailyVolume = 100_000_000; // 100M PANGI
      const averageTaxRate = 100; // 1% average
      
      const dailyTax = calculateTax(dailyVolume, averageTaxRate);
      const annualTax = dailyTax * 365;
      
      expect(dailyTax).toBe(1_000_000); // 1M per day
      expect(annualTax).toBe(365_000_000); // 365M per year
    });

    test('should calculate annual tax revenue (optimistic)', () => {
      const dailyVolume = 1_000_000_000; // 1B PANGI
      const averageTaxRate = 100; // 1% average
      
      const dailyTax = calculateTax(dailyVolume, averageTaxRate);
      const annualTax = dailyTax * 365;
      
      expect(dailyTax).toBe(10_000_000); // 10M per day
      expect(annualTax).toBe(3_650_000_000); // 3.65B per year
    });
  });

  describe('Conservation Fund Impact', () => {
    test('should track conservation fund growth', () => {
      const conservationFund = {
        balance: 0,
        dailyIncome: [] as number[],
      };
      
      // Simulate 30 days of tax collection
      for (let day = 1; day <= 30; day++) {
        const dailyVolume = 500_000_000; // 500M PANGI
        const dailyTax = calculateTax(dailyVolume, 100); // 1% average
        
        conservationFund.balance += dailyTax;
        conservationFund.dailyIncome.push(dailyTax);
      }
      
      expect(conservationFund.balance).toBe(150_000_000); // 150M after 30 days
      expect(conservationFund.dailyIncome).toHaveLength(30);
      expect(conservationFund.dailyIncome[0]).toBe(5_000_000);
    });
  });
});
