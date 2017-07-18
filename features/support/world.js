'use strict';

const { defineSupportCode } = require('cucumber');
const { state, fixtures, cli } = require('@ekino/veggies');

defineSupportCode(({ setWorldConstructor, setDefaultTimeout }) => {
  setDefaultTimeout(5 * 60 * 1000);

  setWorldConstructor(function() {
    state.extendWorld(this);
    fixtures.extendWorld(this);
    cli.extendWorld(this);
  });
});

state.install(defineSupportCode);
fixtures.install(defineSupportCode);
cli.install(defineSupportCode);
