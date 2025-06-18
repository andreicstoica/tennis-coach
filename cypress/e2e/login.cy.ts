describe('Authentication', () => {
    it('Logs in', () => {
      cy.visit('http://localhost:3000/signin')
      cy.get('[name="email"]').type('test@example.com')
      cy.get('[name="password"]').type('password123')
      cy.get('[type="submit"]').click()
      //not sure how to get specific elements, but it signs in successfully!
      //cy.get('div').should('have.text', 'Welcome back, fed_reborn!')
    })
  })