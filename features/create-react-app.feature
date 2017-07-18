@create-react-app
Feature: create-react-app

  Scenario: Omitting project directory
    When I run command node packages/create-react-app/createReactApp.js
    Then exit code should be 1
    And stderr should contain Please specify the project directory

  Scenario Outline: Passing invalid project directory
    When I run command node packages/create-react-app/createReactApp.js <project_directory>
    Then exit code should be 1
    And stderr should contain Could not create a project called "<project_directory>" because of npm naming restrictions

    Examples:
      | project_directory |
      | in)valid          |
      | éïö               |
      | my:project        |

  Scenario: Using already existing project directory
    When I run command node packages/create-react-app/createReactApp.js packages
    Then exit code should be 1
    And stdout should contain The directory packages contains files that could conflict

  Scenario: Using a project directory which match already defined package name
    When I run command node packages/create-react-app/createReactApp.js react
    Then exit code should be 1
    And stderr should contain We cannot create a project called react because a dependency with the same name exists
    And stderr should contain Please choose a different project name

#  @success
#  Scenario: Using tarball url for react scripts
#    When I run command node packages/create-react-app/createReactApp.js --scripts-version=https://registry.npmjs.org/react-scripts/-/react-scripts-0.4.0.tgz test-app-tarball-url
#    And dump stdout
#    Then exit code should be 0
