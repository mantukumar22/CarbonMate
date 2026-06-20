import { describe, it, expect } from "vitest";
import {
  calculateTransportCO2,
  calculateFoodCO2,
  calculateEnergyCO2,
  calculateTotalCO2,
  co2ToTrees,
} from "../lib/emissionFactors";

describe("Emission Factors Calculations", () => {
  describe("Transport CO2 Calculations", () => {
    it("calculates car transport emissions correctly", () => {
      expect(calculateTransportCO2("car", 50)).toBeCloseTo(10.5); // 50 * 0.21
    });

    it("calculates auto transport emissions correctly", () => {
      expect(calculateTransportCO2("auto", 10)).toBeCloseTo(1.0); // 10 * 0.10
    });

    it("calculates bus transport emissions correctly", () => {
      expect(calculateTransportCO2("bus", 20)).toBeCloseTo(1.0); // 20 * 0.05
    });

    it("returns 0 for zero-emission travel paths like bicycle or walking", () => {
      expect(calculateTransportCO2("bike", 100)).toBe(0);
      expect(calculateTransportCO2("walk", 100)).toBe(0);
    });

    it("returns 0 for zero distance", () => {
      expect(calculateTransportCO2("car", 0)).toBe(0);
    });

    it("throws a clear exception for invalid negative distance ranges", () => {
      expect(() => calculateTransportCO2("car", -5)).toThrow("Distance cannot be negative");
    });
  });

  describe("Food Choice Calculations", () => {
    it("calculates high beef carbon correctly", () => {
      expect(calculateFoodCO2("beef")).toBeCloseTo(6.0);
    });

    it("calculates chicken consumption emissions", () => {
      expect(calculateFoodCO2("chicken")).toBeCloseTo(2.0);
    });

    it("calculates vegetarian diet offset expectations", () => {
      expect(calculateFoodCO2("vegetarian")).toBeCloseTo(1.5);
    });

    it("calculates clean vegan meal metrics", () => {
      expect(calculateFoodCO2("vegan")).toBeCloseTo(0.9);
    });

    it("gracefully falls back to neutral-diet average for unknown entries", () => {
      expect(calculateFoodCO2("unknown")).toBeCloseTo(1.5);
    });
  });

  describe("Energy CO2 Calculations", () => {
    it("calculates electricity metrics correctly based on kWh", () => {
      expect(calculateEnergyCO2(10, 0)).toBeCloseTo(8.2); // 10 * 0.82
    });

    it("calculates air conditioning runtime impacts correctly in hours", () => {
      expect(calculateEnergyCO2(0, 2)).toBeCloseTo(2.46); // 2 hr * 1.5 kwh/hr * 0.82
    });

    it("combines base electricity and active cooling runtime seamlessly", () => {
      expect(calculateEnergyCO2(5, 1)).toBeCloseTo(5.33); // (5 + 1.5) * 0.82 = 5.33
    });

    it("returns 0 when household energy accounts are completely silent", () => {
      expect(calculateEnergyCO2(0, 0)).toBe(0);
    });
  });

  describe("Cumulative Total Calculations", () => {
    it("can merge transport modes, food, and energy into flat indices", () => {
      const result = calculateTotalCO2({
        transport: [{ mode: "car", distance: 10 }],
        food: ["vegetarian"],
        energy: { electricity: 2, ac: 1 },
      });
      expect(result).toBeCloseTo(6.33);
    });
  });

  describe("Trees Conversion Offset Metrics", () => {
    it("calculates dynamic tree offsets correctly for various values", () => {
      expect(co2ToTrees(21)).toBeCloseTo(1.0); // 1 tree handles roughly 21kg CO2/yr
      expect(co2ToTrees(42)).toBeCloseTo(2.0);
    });

    it("safely handles inactive carbon ratings zero or negative values", () => {
      expect(co2ToTrees(0)).toBe(0);
      expect(co2ToTrees(-12)).toBe(0);
    });
  });
});
