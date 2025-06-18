import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import HomePage from "../src/app/page";

test("HomePage renders correctly", () => {
  render(<HomePage />);

  const main = within(screen.getByRole("main"));
  const link = main.queryByRole("link");
  expect(link).toBeNull();

  // e.g., expect(screen.getByText("Some text on the page")).toBeInTheDocument();
});
