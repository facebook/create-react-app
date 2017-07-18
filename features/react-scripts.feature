@react-scripts
Feature: react-scripts

  Scenario: Without specifying command
    When I run command packages/react-scripts/bin/react-scripts.js
    Then exit code should be 0
    And stdout should contain Unknown script "undefined"

  Scenario: Specifying a non existing command
    When I run command packages/react-scripts/bin/react-scripts.js invalid
    Then exit code should be 0
    And stdout should contain Unknown script "invalid"