describe('Navigation', () => {
    it('should navigate to the home page', () => {
      // Start from the index page
      cy.visit('/')
    })


    it('loads to /signin', () => {
        cy.visit('/signin')
        cy.url().should('include', '/signin');
    })

    it('should have google sign in', () => {
        cy.visit('/signin')
        // gets stuck here, but loads the rest!
        cy.contains('Google').click()    
        cy.contains('Sign In').click()
        cy.contains('Sign Up').click()

    })
  })