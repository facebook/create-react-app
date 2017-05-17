/* @flow */
import {
  register as registerError,
  unregister as unregisterError,
} from './effects/unhandledError';
import {
  register as registerPromise,
  unregister as unregisterPromise,
} from './effects/unhandledRejection';
import {
  register as registerShortcuts,
  unregister as unregisterShortcuts,
  handler as keyEventHandler,
  SHORTCUT_ESCAPE,
  SHORTCUT_LEFT,
  SHORTCUT_RIGHT,
} from './effects/shortcuts';
import {
  register as registerStackTraceLimit,
  unregister as unregisterStackTraceLimit,
} from './effects/stackTraceLimit';
import {
  permanentRegister as permanentRegisterConsole,
  registerReactStack,
  unregisterReactStack,
} from './effects/proxyConsole';
import { massage as massageWarning } from './utils/warnings';

import {
  consume as consumeError,
  getErrorRecord,
  drain as drainErrors,
} from './utils/errorRegister';
import type { ErrorRecordReference } from './utils/errorRegister';

import type { StackFrame } from './utils/stack-frame';
import { iframeStyle } from './styles';
import { applyStyles } from './utils/dom/css';
import { createOverlay } from './components/overlay';
import { updateAdditional } from './components/additional';

const CONTEXT_SIZE: number = 3;
let iframeReference: HTMLIFrameElement | null = null;
let additionalReference = null;
let errorReferences: ErrorRecordReference[] = [];
let currReferenceIndex: number = -1;

function render(name: ?string, message: string, resolvedFrames: StackFrame[]) {
  disposeCurrentView();

  const iframe = window.document.createElement('iframe');
  applyStyles(iframe, iframeStyle);
  iframeReference = iframe;
  iframe.onload = () => {
    if (iframeReference == null) {
      return;
    }
    const w = iframeReference.contentWindow;
    const document = iframeReference.contentDocument;

    const { overlay, additional } = createOverlay(
      document,
      name,
      message,
      resolvedFrames,
      CONTEXT_SIZE,
      currReferenceIndex + 1,
      errorReferences.length,
      offset => {
        switchError(offset);
      },
      () => {
        unmount();
      }
    );
    if (w != null) {
      w.onkeydown = event => {
        keyEventHandler(type => shortcutHandler(type), event);
      };
    }
    if (document.body != null) {
      document.body.style.margin = '0';
      // Keep popup within body boundaries for iOS Safari
      // $FlowFixMe
      document.body.style['max-width'] = '100vw';

      (document.body: any).appendChild(overlay);
    }
    additionalReference = additional;
  };
  window.document.body.appendChild(iframe);
}

function renderErrorByIndex(index: number) {
  currReferenceIndex = index;

  const { error, unhandledRejection, enhancedFrames } = getErrorRecord(
    errorReferences[index]
  );

  if (unhandledRejection) {
    render(
      'Unhandled Rejection (' + error.name + ')',
      error.message,
      enhancedFrames
    );
  } else {
    render(error.name, error.message, enhancedFrames);
  }
}

function switchError(offset) {
  const nextView = currReferenceIndex + offset;
  if (nextView < 0 || nextView >= errorReferences.length) {
    return;
  }
  renderErrorByIndex(nextView);
}

function disposeCurrentView() {
  if (iframeReference === null) {
    return;
  }
  window.document.body.removeChild(iframeReference);
  iframeReference = null;
  additionalReference = null;
}

function unmount() {
  disposeCurrentView();
  drainErrors();
  errorReferences = [];
  currReferenceIndex = -1;
}

function crash(error: Error, unhandledRejection = false) {
  if (module.hot && typeof module.hot.decline === 'function') {
    module.hot.decline();
  }
  consumeError(error, unhandledRejection, CONTEXT_SIZE)
    .then(ref => {
      if (ref == null) {
        return;
      }
      errorReferences.push(ref);
      if (iframeReference !== null && additionalReference !== null) {
        updateAdditional(
          iframeReference.contentDocument,
          additionalReference,
          currReferenceIndex + 1,
          errorReferences.length,
          offset => {
            switchError(offset);
          }
        );
      } else {
        if (errorReferences.length !== 1) {
          throw new Error('Something is *really* wrong.');
        }
        renderErrorByIndex((currReferenceIndex = 0));
      }
    })
    .catch(e => {
      console.log('Could not consume error:', e);
    });
}

function shortcutHandler(type: string) {
  switch (type) {
    case SHORTCUT_ESCAPE: {
      unmount();
      break;
    }
    case SHORTCUT_LEFT: {
      switchError(-1);
      break;
    }
    case SHORTCUT_RIGHT: {
      switchError(1);
      break;
    }
    default: {
      //TODO: this
      break;
    }
  }
}

function inject() {
  registerError(window, error => crash(error));
  registerPromise(window, error => crash(error, true));
  registerShortcuts(window, shortcutHandler);
  registerStackTraceLimit();

  registerReactStack();
  permanentRegisterConsole('error', (warning, stack) => {
    const data = massageWarning(warning, stack);
    crash(
      // $FlowFixMe
      {
        message: data.message,
        stack: data.stack,
        __unmap_source: '/static/js/bundle.js',
      },
      false
    );
  });
}

function uninject() {
  unregisterStackTraceLimit();
  unregisterShortcuts(window);
  unregisterPromise(window);
  unregisterError(window);
  unregisterReactStack();
}

export { inject, uninject };
