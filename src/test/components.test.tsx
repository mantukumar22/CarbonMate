import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImpactCard from "../components/ImpactCard";
import EcoBuddy from "../components/EcoBuddy";
import ChatLogger from "../components/ChatLogger";

describe("UI React Component Render and Interaction Tests", () => {
  describe("ImpactCard Component", () => {
    it("renders carbon weight output correctly", () => {
      render(<ImpactCard co2={10.5} category="transport" />);
      expect(screen.getByText("10.5 kg")).toBeInTheDocument();
    });

    it("displays yearly offset values aligned with tree count calculation", () => {
      render(<ImpactCard co2={21.0} category="diet" />);
      expect(screen.getByText(/absorption of 1.0 trees/i)).toBeInTheDocument();
    });

    it("maps categories correctly", () => {
      render(<ImpactCard co2={5} category="food" />);
      expect(screen.getByText("food")).toBeInTheDocument();
    });

    it("safely handles 0 weight parameters gracefully", () => {
      render(<ImpactCard co2={0} category="transport" />);
      expect(screen.getByText("0 kg")).toBeInTheDocument();
    });
  });

  describe("EcoBuddy Animated Character Representation", () => {
    it("shows healthy ecstatic/happy state when daily carbon footprint is very low", () => {
      render(<EcoBuddy co2Today={3} />);
      expect(screen.getByText(/smiling/i)).toBeInTheDocument();
    });

    it("shows balanced neutral guidance for moderate daily carbon usage", () => {
      render(<EcoBuddy co2Today={10} />);
      // "EcoBuddy is Okay 😐" contains Okay
      expect(screen.getByText(/okay/i)).toBeInTheDocument();
    });

    it("paints a concerned/worried warning card for high levels of carbon daily", () => {
      render(<EcoBuddy co2Today={25} />);
      expect(screen.getByText(/reduce/i)).toBeInTheDocument();
    });

    it("draws fallback illustration states smoothly on zero footprint score accounts", () => {
      render(<EcoBuddy co2Today={0} />);
      expect(screen.getByAltText(/ecobuddy/i)).toBeInTheDocument();
    });
  });

  describe("ChatLogger Component", () => {
    it("renders text area entry console and subtext inputs correctly", () => {
      render(<ChatLogger onSubmit={vi.fn()} />);
      expect(screen.getByPlaceholderText(/example:/i)).toBeInTheDocument();
    });

    it("presents an option to analyze or save daily score with check button", () => {
      render(<ChatLogger onSubmit={vi.fn()} />);
      expect(screen.getByRole("button", { name: /check my score/i })).toBeInTheDocument();
    });

    it("disables submittal controls when text entry remains empty or whitespace", () => {
      render(<ChatLogger onSubmit={vi.fn()} />);
      const btn = screen.getByRole("button", { name: /check my score/i });
      expect(btn).toBeDisabled();
    });

    it("enables submittal controls as soon as user keys in some context", async () => {
      render(<ChatLogger onSubmit={vi.fn()} />);
      const textInput = screen.getByPlaceholderText(/example:/i);
      const btn = screen.getByRole("button", { name: /check my score/i });
      
      await userEvent.type(textInput, "drove car 10km");
      expect(textInput).toHaveValue("drove car 10km");
      expect(btn).not.toBeDisabled();
    });

    it("fires accurate submit trigger callback containing custom typed text on click", async () => {
      const mockSubmit = vi.fn().mockImplementation(() => Promise.resolve());
      render(<ChatLogger onSubmit={mockSubmit} />);
      
      const textInput = screen.getByPlaceholderText(/example:/i);
      const btn = screen.getByRole("button", { name: /check my score/i });
      
      await userEvent.type(textInput, "drove train 5km");
      await userEvent.click(btn);
      
      expect(mockSubmit).toHaveBeenCalledWith("drove train 5km");
    });

    it("instantly wipes text area values after a successful transaction", async () => {
      const mockSubmit = vi.fn().mockImplementation(() => Promise.resolve());
      render(<ChatLogger onSubmit={mockSubmit} />);
      
      const textInput = screen.getByPlaceholderText(/example:/i);
      const btn = screen.getByRole("button", { name: /check my score/i });
      
      await userEvent.type(textInput, "used AC today");
      await userEvent.click(btn);
      
      await waitFor(() => {
        expect(textInput).toHaveValue("");
      });
    });
  });
});
