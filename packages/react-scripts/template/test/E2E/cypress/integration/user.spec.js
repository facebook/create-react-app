describe('Ivory Registration Flow', () => {
  const random = Math.random().toString(36).substring(7)

  beforeEach(() => {
    cy.fixture('user').as('admin')
  })

  it('should display sign in screen when app is loaded', function signIn () {
    cy.visit('/')
    cy.get('[data-test="signin-title"]')
    cy.get('[data-test="username-input-signin"]').should('have.value', '')
    cy.get('[data-test="password-input-signin"]').should('have.value', '')
    cy.get('[data-test="signin-button"]')
    cy.get('[data-test="anchor-to-signup"]')
  })

  it('should navigate from sign in to sign up', function () {
    cy.get('[data-test="anchor-to-signup"]').click()
  })

  it('should display sign up screen', function () {
    cy.get('[data-test="signup-title"]')
    cy.get('[data-test="email-input-signup"]')
    cy.get('[data-test="password-input-signup"]')
    cy.get('[data-test="firstname-input-signup"]')
    cy.get('[data-test="lastname-input-signup"]')
    cy.get('[data-test="city-input-signup"]')
    cy.get('[data-test="country-input-signup"]')
    cy.get('[data-test="signup-button"]')
    cy.get('[data-test="anchor-to-signin"]')
  })

  it('should navigate from sign up to sign in', function () {
    cy.get('[data-test="anchor-to-signin"]').click()
  })

  it('should sign up successfully new user with valid data and redirect him to sign in screen', function signUp () {
    const {
      signUpData: { email, password, firstName, lastName, city, country }
    } = this.admin
    const randomEmail = random + email

    cy.get('[data-test="anchor-to-signup"]').click()
    cy.get('[data-test="email-input-signup"]').type(randomEmail)
    cy.get('[data-test="password-input-signup"]').type(password)
    cy.get('[data-test="firstname-input-signup"]').type(firstName)
    cy.get('[data-test="lastname-input-signup"]').type(lastName)
    cy.get('[data-test="city-input-signup"]').type(city)
    cy.get('[data-test="country-input-signup"]').type(country)
    cy.get('[data-test="signup-button"]').click()
    cy.get('[data-test="signin-title"]')
  })

  it('should be able to log into the app after signing up successfully', function signIn () {
    const {
      signIn: { email, password }
    } = this.admin
    const randomEmail = random + email

    cy.wait(2000)
    cy.get('[data-test="username-input-signin"]').type(randomEmail)
    cy.get('[data-test="password-input-signin"]').type(password)
    cy.get('[data-test="signin-button"]').click()
  })

  it('should display Welcome, ${firstName} ${lastName}', function () {
    const {
      signUpData: { firstName, lastName }
    } = this.admin

    cy.get('div').contains(`Welcome, ${firstName} ${lastName}`)
    cy.wait(1000)
  })

  it('should log out successfully', function () {
    cy.get('[data-test="signout-button"]').click()
    cy.get('[data-test="signout-modal"]')
    cy.get('[data-test="confirm-button-signout"]').click()
    cy.get('[data-test="signin-title"]')
  })
})
