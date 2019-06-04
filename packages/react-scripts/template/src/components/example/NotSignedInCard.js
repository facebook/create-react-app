import React from 'react'
import { Button, Card, CardActions, CardContent } from '@fs/zion-ui'

const NotSignedInCard = ({ user: { userLoading } }) => (
  <Card>
    <CardContent>
      {userLoading ? <p>User loading ...</p> : <p>You must sign in to see this content</p>}
    </CardContent>
    <CardActions>
      <Button disabled={userLoading} size="small" color="primary" href="/auth/familysearch/login">
        Sign In
      </Button>
    </CardActions>
  </Card>
)

export default NotSignedInCard
