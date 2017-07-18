@development_environment
Feature:

  As a contributor of create-react-app, I should have a working development environment.
  This does not affect end users but makes sure we can develop it.

  Scenario: Running build command
    When I run command npm run build
    Then exit code should be 0
    And stdout should contain Compiled successfully
    #And file build/*.html should exist
    #And file build/static/js/*.js should exist
    #And file build/static/css/*.css should exist
    #And file build/static/media/*.svg should exist
    #And file build/favicon.ico should exist

  Scenario: Running tests
    Given I set CI env var to true
    When I run command npm test
    Then exit code should be 0
    # @todo Uncomment when snapshot testing is enabled by default
    #And file template/src/__snapshots__/App.test.js.snap should exist

#  Scenario: Starting development server
#    When I run command npm start -- --smoke-test
#    Then exit code should be 0
#    And dump stdout
#    And dump stderr
#    And stdout should contain Starting the development server
#    And stdout should contain Compiled successfully!