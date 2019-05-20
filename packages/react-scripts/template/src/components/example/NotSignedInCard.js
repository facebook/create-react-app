import React from 'react'
import { css } from '@emotion/core'
import { Button, Card, CardActions, CardContent } from '@fs/zion-ui'

const cardStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const cardContentStyle = css`
  flex-grow: 1;
`

const NotSignedInCard = ({ userLoading }) => (
  <Card css={cardStyle}>
    <CardContent css={cardContentStyle}>
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
