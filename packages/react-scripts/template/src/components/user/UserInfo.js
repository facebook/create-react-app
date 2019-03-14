import React from 'react';
import {useUser} from '@fs/user';

export default function UserInfo(){
  const user = useUser();
  return (<div>Hello, {user.displayName}!</div>)
}
