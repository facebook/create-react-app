// This is a magic file. You don't need to do anything special.
// Jest looks for this file before running any tests.

// Use this file, to reduce boilerplate when writing tests. Add code that
// needs to be run for all or most of your tests. The most common
// things found in a file like this are afterEach(), beforeEach(),
// afterAll(), beforeAll(), and any specific setup you need for your
// particular application/component.

/* eslint-disable import/no-extraneous-dependencies */
import { cleanup } from '@fs/zion-testing-library'
import 'jest-dom/extend-expect'

// afterEach is called after every test runs. AfterEach takes in a function.
// The cleanup function, which is passed into afterEach, unmounts React trees
// that were mounted with render. Not calling cleanup after calling a render within tests
// can result in memory leaks and false negative/positives for subsequent tests.
// In our training with Kent C. Dodds, he highly recommended that we do this.
afterEach(cleanup)
