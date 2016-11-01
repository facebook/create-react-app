import React from 'react';

export default function EnvVariableMessages() {
  return (
    <div>
      This is a message loaded from an environmental variable in the shell:
      {process.env.REACT_APP_SHELL_ENV_MESSAGE}.
      And this is loaded from a .env file:
      {process.env.REACT_APP_ENV_FILE_MESSAGE}.
    </div>
  )
}
