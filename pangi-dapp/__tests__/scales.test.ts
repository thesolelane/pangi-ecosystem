/**
 * Tests for scales utility functions
 */

import {
  pangiToScales,
  scalesToPangi,
  formatPangi,
  formatPangiDetailed,
  formatScalesCompact,
  parsePangiInput,
} from '../lib/solana/tokens';

describe('Scales Utilities', () => {
  describe('pangiToScales', () => {
    it('converts 1 PANGI to 1 billion scales', () => {
      expect(pangiToScales(1)).toBe(1_000_000_000);
    });

    it('converts 10 PANGI to 10 billion scales', () => {
      expect(pangiToScales(10)).toBe(10_000_000_000);
    });

    it('converts 0.5 PANGI to 500 million scales', () => {
      expect(pangiToScales(0.5)).toBe(500_000_000);
    });

    it('converts 0.000001 PANGI to 1000 scales', () => {
      expect(pangiToScales(0.000001)).toBe(1000);
    });

    it('handles zero', () => {
      expect(pangiToScales(0)).toBe(0);
    });
  });

  describe('scalesToPangi', () => {
    it('converts 1 billion scales to 1 PANGI', () => {
      expect(scalesToPangi(1_000_000_000)).toBe(1);
    });

    it('converts 10 billion scales to 10 PANGI', () => {
      expect(scalesToPangi(10_000_000_000)).toBe(10);
    });

    it('converts 500 million scales to 0.5 PANGI', () => {
      expect(scalesToPangi(500_000_000)).toBe(0.5);
    });

    it('converts 1000 scales to 0.000001 PANGI', () => {
      expect(scalesToPangi(1000)).toBe(0.000001);
    });

    it('handles zero', () => {
      expect(scalesToPangi(0)).toBe(0);
    });
  });

  describe('formatPangi', () => {
    it('formats large amounts in PANGI', () => {
      expect(formatPangi(10_000_000_000_000)).toContain('10,000 PANGI');
    });

    it('formats medium amounts in PANGI', () => {
      expect(formatPangi(1_000_000_000)).toContain('1 PANGI');
    });

    it('formats small amounts in scales', () => {
      expect(formatPangi(1000)).toContain('scales');
    });

    it('formats zero correctly', () => {
      expect(formatPangi(0)).toContain('0');
    });
  });

  describe('formatPangiDetailed', () => {
    it('shows both PANGI and scales for large amounts', () => {
      const result = formatPangiDetailed(10_000_000_000);
      expect(result).toContain('PANGI');
      expect(result).toContain('scales');
    });

    it('shows only scales for small amounts', () => {
      const result = formatPangiDetailed(1000);
      expect(result).toContain('scales');
      expect(result).not.toContain('PANGI');
    });
  });

  describe('formatScalesCompact', () => {
    it('formats trillions', () => {
      expect(formatScalesCompact(10_000_000_000_000)).toContain('T');
    });

    it('formats billions', () => {
      expect(formatScalesCompact(10_000_000_000)).toContain('B');
    });

    it('formats millions', () => {
      expect(formatScalesCompact(10_000_000)).toContain('M');
    });

    it('formats thousands', () => {
      expect(formatScalesCompact(10_000)).toContain('K');
    });

    it('formats small numbers without suffix', () => {
      expect(formatScalesCompact(100)).toBe('100 scales');
    });
  });

  describe('parsePangiInput', () => {
    it('parses valid PANGI input', () => {
      expect(parsePangiInput('10')).toBe(10_000_000_000);
    });

    it('parses decimal input', () => {
      expect(parsePangiInput('0.5')).toBe(500_000_000);
    });

    it('handles invalid input', () => {
      expect(parsePangiInput('invalid')).toBe(0);
    });

    it('handles empty input', () => {
      expect(parsePangiInput('')).toBe(0);
    });
  });

  describe('Round-trip conversions', () => {
    it('converts PANGI to scales and back', () => {
      const pangi = 123.456;
      const scales = pangiToScales(pangi);
      const backToPangi = scalesToPangi(scales);
      expect(backToPangi).toBeCloseTo(pangi, 6);
    });

    it('handles large numbers', () => {
      const pangi = 1_000_000;
      const scales = pangiToScales(pangi);
      const backToPangi = scalesToPangi(scales);
      expect(backToPangi).toBe(pangi);
    });

    it('handles small numbers', () => {
      const pangi = 0.000001;
      const scales = pangiToScales(pangi);
      const backToPangi = scalesToPangi(scales);
      expect(backToPangi).toBeCloseTo(pangi, 9);
    });
  });
});
