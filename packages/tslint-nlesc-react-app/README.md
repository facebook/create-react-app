TSlint configuration for used in `@nlesc/react-scripts` package.

TSlint ruleset which combines:

* tslint-microsoft-contrib
* tslint-react
* tslint:latest

To use in `create-react-app` we overridden several rules to make it compatible with webpack and have similar rules to eslint-config-react-app package.

# Overridden rules

* import-name, webpack allows for import of assets like svg and css
* jsx-alignment, want linting on jsx 
* jsx-no-lambda, want linting on jsx
* jsx-no-string-ref, want linting on jsx
* jsx-no-multiline-js, want linting on jsx
* jsx-self-close, want linting on jsx
* member-access, everything that has no access modifier is public implicitly, so no need to specify public again
* missing-jsdoc, not usefull for an application, it would be for a library
* no-relative-imports, not practical for an application, it would be for a library because it has a package name
* no-for-in-array, tslint in create-react-app does not do typecheck
* restrict-plus-operands, tslint in create-react-app does not do typecheck
* quotemark
    
    * single, single quote because its less typing
    * jsx-double, jsx-double because thats the html way
    * avoid-escape, part of tslint:latest

* variable-name 
 
    * removed check-format, both camelCased and UPPER_CASED vars in same file
    * removed allow-pascal-case, PascalCase is reserved for classes

* whitespace

