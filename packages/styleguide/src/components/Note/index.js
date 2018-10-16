import React from 'react';

import Note from './Note';

export const NoteWarning = props => <Note type="warning" {...props} />;
NoteWarning.displayName = 'NoteWarning';

export const NoteError = props => <Note type="error" {...props} />;
NoteError.displayName = 'NoteError';

export const NoteInfo = props => <Note type="info" {...props} />;
NoteInfo.displayName = 'NoteInfo';

export const Dos = props => <Note type="success" title="Do's" {...props} />;
Dos.displayName = 'Dos';

export const Donts = props => <Note type="error" title="Dont's" {...props} />;
Donts.displayName = 'Donts';

export default Note;
