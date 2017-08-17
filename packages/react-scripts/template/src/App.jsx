import React from 'react';
import { BpkCode } from 'bpk-component-code';
import BpkButton from 'bpk-component-button';
import BpkText from 'bpk-component-text';
import { BpkGridContainer, BpkGridRow, BpkGridColumn } from 'bpk-component-grid';

import STYLES from './App.scss';

const App = () => (
  <div className={STYLES.App}>
    <header className={STYLES.App__header}>
      <BpkGridContainer>
        <BpkGridRow>
          <BpkGridColumn width={12}>
            <BpkText tagName="h1" textStyle="xxl" className={STYLES.App__heading}>Welcome to React + Backpack</BpkText>
          </BpkGridColumn>
        </BpkGridRow>
      </BpkGridContainer>
    </header>
    <main className={STYLES.App__main}>
      <BpkGridContainer>
        <BpkGridRow>
          <BpkGridColumn width={12}>
            <BpkText tagName="p" className={STYLES.App__text}>
              To get started, edit <BpkCode>src/App.jsx</BpkCode> and save to reload.
            </BpkText>
            <BpkButton onClick={() => alert('It works!')}>Click me</BpkButton>
          </BpkGridColumn>
        </BpkGridRow>
      </BpkGridContainer>
    </main>
  </div>
);

export default App;
