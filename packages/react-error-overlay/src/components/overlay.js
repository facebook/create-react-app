/* @flow */
import { applyStyles } from '../utils/dom/css';
import { overlayStyle, headerStyle, additionalStyle } from '../styles';
import { createClose } from './close';
import { createFrames } from './frames';
import { createFooter } from './footer';
import type { CloseCallback } from './close';
import type { StackFrame } from '../utils/stack-frame';
import { updateAdditional } from './additional';
import type { FrameSetting } from './frames';
import type { SwitchCallback } from './additional';

function createOverlay(
  document: Document,
  name: string,
  message: string,
  frames: StackFrame[],
  contextSize: number,
  currentError: number,
  totalErrors: number,
  switchCallback: SwitchCallback,
  closeCallback: CloseCallback
): {
  overlay: HTMLDivElement,
  additional: HTMLDivElement,
} {
  const frameSettings: FrameSetting[] = frames.map(() => ({ compiled: false }));
  // Create overlay
  const overlay = document.createElement('div');
  applyStyles(overlay, overlayStyle);
  overlay.appendChild(createClose(document, closeCallback));

  // Create container
  const container = document.createElement('div');
  container.className = 'cra-container';
  overlay.appendChild(container);

  // Create additional
  const additional = document.createElement('div');
  applyStyles(additional, additionalStyle);
  container.appendChild(additional);
  updateAdditional(
    document,
    additional,
    currentError,
    totalErrors,
    switchCallback
  );

  // Create header
  const header = document.createElement('div');
  applyStyles(header, headerStyle);

  // Make message prettier
  let finalMessage = message.match(/^\w*:/) ? message : name + ': ' + message;
  finalMessage = finalMessage
    // TODO: maybe remove this prefix from fbjs?
    // It's just scaring people
    .replace('Invariant Violation: ', '')
    // Break the actionable part to the next line.
    // AFAIK React 16+ should already do this.
    .replace(' Check the render method', '\n\nCheck the render method');

  // Put it in the DOM
  header.appendChild(document.createTextNode(finalMessage));
  container.appendChild(header);

  // Create trace
  container.appendChild(
    createFrames(document, frames, frameSettings, contextSize)
  );

  // Show message
  container.appendChild(createFooter(document));

  return {
    overlay,
    additional,
  };
}

export { createOverlay };
