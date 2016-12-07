import React from 'react';

export default function EnvVariableMessages() {
  return (
    <div>
      This is a message loaded from an environmental variable in the shell:
      <span id="shell-env">{process.env.REACT_APP_SHELL_ENV_MESSAGE}.</span>
      And this is loaded from a .env file:
      <span id="file-env">{process.env.REACT_APP_ENV_FILE_MESSAGE}.</span>
    </div>
  )
}
