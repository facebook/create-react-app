/* @flow */
import type { StackFrame } from '../utils/stack-frame';
import { applyStyles } from '../utils/dom/css';
import { traceStyle, toggleStyle } from '../styles';
import { enableTabClick } from '../utils/dom/enableTabClick';
import { createFrame } from './frame';

type OmitsObject = {
  value: number,
  bundle: number,
  hasReachedAppCode: boolean,
};
type FrameSetting = { compiled: boolean };
export type { OmitsObject, FrameSetting };

function createFrameWrapper(
  document: Document,
  parent: HTMLDivElement,
  factory,
  lIndex: number,
  frameSettings: FrameSetting[],
  contextSize: number
) {
  const fac = factory();
  if (fac == null) {
    return;
  }
  const { hasSource, elem, collapseElement } = fac;

  const elemWrapper = document.createElement('div');
  elemWrapper.appendChild(elem);

  if (hasSource) {
    const compiledDiv = document.createElement('div');
    enableTabClick(compiledDiv);
    applyStyles(compiledDiv, toggleStyle);

    const o = frameSettings[lIndex];
    const compiledText = document.createTextNode(
      'View ' + (o && o.compiled ? 'source' : 'compiled')
    );
    compiledDiv.addEventListener('click', function() {
      if (o) {
        o.compiled = !o.compiled;
      }

      const next = createFrameWrapper(
        document,
        parent,
        factory,
        lIndex,
        frameSettings,
        contextSize
      );
      if (next != null) {
        parent.insertBefore(next, elemWrapper);
        parent.removeChild(elemWrapper);
      }
    });
    compiledDiv.appendChild(compiledText);
    elemWrapper.appendChild(compiledDiv);
  }

  if (collapseElement != null) {
    elemWrapper.appendChild(collapseElement);
  }

  return elemWrapper;
}

function createFrames(
  document: Document,
  resolvedFrames: StackFrame[],
  frameSettings: FrameSetting[],
  contextSize: number,
  errorName: ?string
) {
  if (resolvedFrames.length !== frameSettings.length) {
    throw new Error(
      'You must give a frame settings array of identical length to resolved frames.'
    );
  }
  const trace = document.createElement('div');
  applyStyles(trace, traceStyle);

  let index = 0;
  let critical = true;
  const omits: OmitsObject = { value: 0, bundle: 1, hasReachedAppCode: false };
  resolvedFrames.forEach(function(frame) {
    const lIndex = index++;
    const elem = createFrameWrapper(
      document,
      trace,
      createFrame.bind(
        undefined,
        document,
        frameSettings[lIndex],
        frame,
        contextSize,
        critical,
        omits,
        omits.bundle,
        trace,
        index === resolvedFrames.length,
        errorName
      ),
      lIndex,
      frameSettings,
      contextSize
    );
    if (elem == null) {
      return;
    }
    critical = false;
    trace.appendChild(elem);
  });
  //TODO: fix this
  omits.value = 0;

  return trace;
}

export { createFrames };
