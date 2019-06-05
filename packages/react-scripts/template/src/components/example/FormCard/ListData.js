import React from 'react'
import { List, ListItem, ListItemText } from '@fs/zion-ui/list'

export default function ListData({ data }) {
  // All the components used in this component come from zion.
  // This component is just for listing the data that comes from the form.
  return (
    <List>
      <ListItem divider>
        <ListItemText
          primary="Username"
          secondary={(data && data.username) || 'No username yet.'}
        />
      </ListItem>
      <ListItem divider>
        <ListItemText
          primary="Password"
          secondary={(data && data.password.replace(/./g, '*')) || 'No password yet.'}
        />
      </ListItem>
      <ListItem divider>
        <ListItemText
          primary="Favorite Food"
          secondary={(data && data.food) || 'No favorite food yet.'}
        />
      </ListItem>
      <ListItem divider>
        <ListItemText primary="Email" secondary={(data && data.email) || 'No email yet.'} />
      </ListItem>
      <ListItem>
        <ListItemText primary="Age" secondary={(data && data.age) || 'No age yet.'} />
      </ListItem>
    </List>
  )
}
