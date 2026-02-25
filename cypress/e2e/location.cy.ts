describe("Location autocomplete", () => {
  it("types lah and selects Lahore, Punjab, Pakistan and populates hidden field", () => {
    cy.visit("/pages/persona/PersonaForm") 
    cy.get('input[aria-label="Location autocomplete"]').type("lah")
    cy.wait(500)
    cy.contains("Lahore, Punjab, Pakistan").click()
    cy.get("#locationIdHidden").should("have.value").and("match", /\d+/)
  })
})
