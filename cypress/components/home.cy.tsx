import HomePage from "../../src/app/page";

describe("<HomePage />", () => {
  it("should render and display expected content", () => {
    cy.mount(<HomePage />);

    // The new page should contain an div with "welcome"
    //cy.get("div").contains("Welcome");

    // works!
    cy.get('a[href="/signin"]').should("be.visible");
  });
});
