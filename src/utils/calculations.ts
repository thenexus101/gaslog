import { GasEntry } from '../types/gasEntry';

/**
 * Calculate MPG from mileage and gallons
 */
export function calculateMPG(miles: number, gallons: number): number {
  if (gallons === 0) return 0;
  return miles / gallons;
}

/**
 * Calculate cost per mile
 */
export function calculateCostPerMile(cost: number, miles: number): number {
  if (miles === 0) return 0;
  return cost / miles;
}

/**
 * Calculate distance between fill-ups
 */
export function calculateDistanceBetweenFillUps(
  currentMileage: number,
  previousMileage: number
): number {
  return currentMileage - previousMileage;
}

/**
 * Calculate driving efficiency score (actual MPG vs expected MPG)
 */
export function calculateEfficiencyScore(
  actualMPG: number,
  expectedMPG?: number
): number | null {
  if (!expectedMPG || expectedMPG === 0) return null;
  return (actualMPG / expectedMPG) * 100;
}

/**
 * Calculate actual MPG from gas entry
 */
export function getActualMPG(entry: GasEntry, previousEntry?: GasEntry): number | null {
  if (!previousEntry) return null;
  const miles = entry.mileage - previousEntry.mileage;
  return calculateMPG(miles, entry.gallons);
}

/**
 * Aggregate functions for analytics
 */
export function calculateAverageMPG(entries: GasEntry[]): number {
  if (entries.length === 0) return 0;
  const totalMPG = entries.reduce((sum, entry) => sum + entry.mpg_before, 0);
  return totalMPG / entries.length;
}

export function calculateAveragePricePerGallon(entries: GasEntry[]): number {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, entry) => sum + entry.price_per_gallon, 0);
  return total / entries.length;
}

export function calculateTotalSpending(entries: GasEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.total_cost, 0);
}

export function calculateAverageCostPerFillUp(entries: GasEntry[]): number {
  if (entries.length === 0) return 0;
  return calculateTotalSpending(entries) / entries.length;
}

export function calculateAverageGallonsPerFillUp(entries: GasEntry[]): number {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, entry) => sum + entry.gallons, 0);
  return total / entries.length;
}

export function calculateEmptyTankFrequency(entries: GasEntry[]): number {
  if (entries.length === 0) return 0;
  const emptyCount = entries.filter(entry => entry.added_from_empty).length;
  return (emptyCount / entries.length) * 100;
}

