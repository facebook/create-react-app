/* @flow */
import { applyStyles } from '../utils/dom/css';
import { groupStyle, groupElemLeft, groupElemRight } from '../styles';
import { consumeEvent } from '../utils/dom/consumeEvent';
import { enableTabClick } from '../utils/dom/enableTabClick';

type SwitchCallback = (offset: number) => void;
function updateAdditional(
  document: Document,
  additionalReference: HTMLDivElement,
  currentError: number,
  totalErrors: number,
  switchCallback: SwitchCallback
) {
  if (additionalReference.lastChild) {
    additionalReference.removeChild(additionalReference.lastChild);
  }

  let text = ' ';
  if (totalErrors <= 1) {
    additionalReference.appendChild(document.createTextNode(text));
    return;
  }
  text = `Errors ${currentError} of ${totalErrors}`;
  const span = document.createElement('span');
  span.appendChild(document.createTextNode(text));
  const group = document.createElement('span');
  applyStyles(group, groupStyle);
  const left = document.createElement('button');
  applyStyles(left, groupElemLeft);
  left.addEventListener('click', function(e: MouseEvent) {
    consumeEvent(e);
    switchCallback(-1);
  });
  left.appendChild(document.createTextNode('←'));
  enableTabClick(left);
  const right = document.createElement('button');
  applyStyles(right, groupElemRight);
  right.addEventListener('click', function(e: MouseEvent) {
    consumeEvent(e);
    switchCallback(1);
  });
  right.appendChild(document.createTextNode('→'));
  enableTabClick(right);
  group.appendChild(left);
  group.appendChild(right);
  span.appendChild(group);
  additionalReference.appendChild(span);
}

export type { SwitchCallback };
export { updateAdditional };
