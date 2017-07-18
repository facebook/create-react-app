@environment_url
Feature:

  As a user of create-react-app, I should be able to control build public url.

  Scenario: Using default
    Given I set cwd to test-app
    When I run command npm run build
    Then exit code should be 0
    ## Test default behavior
    #grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 0 || exit 1

  Scenario: Using relative path via package.json
    Given I set cwd to test-app
    When I run command npm run build
    Then exit code should be 0
    ## Test relative path build
    #awk -v n=2 -v s="  \"homepage\": \".\"," 'NR == n {print s} {print}' package.json > tmp && mv tmp package.json
    #
    #npm run build
    ## Disabled until this can be tested
    ## grep -F -R --exclude=*.map "../../static/" build/ -q; test $? -eq 0 || exit 1
    #grep -F -R --exclude=*.map "\"./static/" build/ -q; test $? -eq 0 || exit 1
    #grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  Scenario: Using absolute path via environment variable
    Given I set cwd to test-app
    And I set PUBLIC_URL env var to https://www.example.net/overridetest
    When I run command npm run build
    Then exit code should be 0
    #PUBLIC_URL="/anabsolute" npm run build
    #grep -F -R --exclude=*.map "/anabsolute/static/" build/ -q; test $? -eq 0 || exit 1
    #grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1
    #
    ## Test absolute path build
    #sed "2s/.*/  \"homepage\": \"\/testingpath\",/" package.json > tmp && mv tmp package.json
    #
    #npm run build
    #grep -F -R --exclude=*.map "/testingpath/static/" build/ -q; test $? -eq 0 || exit 1
    #grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  Scenario: Using absolute path via package.json
    Given I set cwd to test-app
    And I set PUBLIC_URL env var to https://www.example.net/overridetest
    When I run command npm run build
    Then exit code should be 0

  Scenario: Using absolute url via environment variable
    Given I set cwd to test-app
    And I set PUBLIC_URL env var to https://www.example.net/overridetest
    When I run command npm run build
    Then exit code should be 0
    #PUBLIC_URL="https://www.example.net/overridetest" npm run build
    #grep -F -R --exclude=*.map "https://www.example.net/overridetest/static/" build/ -q; test $? -eq 0 || exit 1
    #grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1
    #grep -F -R --exclude=*.map "testingpath/static" build/ -q; test $? -eq 1 || exit 1
    ## Test absolute url build
    #sed "2s/.*/  \"homepage\": \"https:\/\/www.example.net\/testingpath\",/" package.json > tmp && mv tmp package.json
    #
    #npm run build
    #grep -F -R --exclude=*.map "/testingpath/static/" build/ -q; test $? -eq 0 || exit 1
    #grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  Scenario: Using absolute url via package.json
    Given I set cwd to test-app
    And I set PUBLIC_URL env var to https://www.example.net/overridetest
    When I run command npm run build
    Then exit code should be 0

