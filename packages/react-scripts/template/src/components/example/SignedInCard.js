import React from 'react'
import { css } from '@emotion/core'
import { Card, CardActions, CardContent } from '@fs/zion-card'
import Button from '@fs/zion-button'
import Chip from '@fs/zion-chip'
import Avatar from '@fs/zion-avatar'
import Dialog, { DialogTitle, useOpener } from '@fs/zion-dialog'

const cardStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const cardContentStyle = css`
  flex-grow: 1;
`

const SignedInCard = ({ user, portrait }) => {
  const dialogOpener = useOpener()
  const { personId, contactName, displayName, gender, cisId } = user
  return (
    <Card css={cardStyle}>
      <CardContent css={cardContentStyle}>
        <h2>Hello {displayName}!</h2>
        <Chip avatar={<Avatar src={portrait} />} label={personId} />
        <Avatar src={portrait} size="large" />

        <Dialog opener={dialogOpener} dismiss="Close" fullscreen>
          <DialogTitle>{contactName}</DialogTitle>

          <div>personId: {personId}</div>
          <div>cisId: {cisId}</div>
          <div>gender: {gender}</div>
        </Dialog>
      </CardContent>

      <CardActions>
        <Button size="small" color="primary" onClick={dialogOpener.open}>
          Open Dialog
        </Button>
        <Button size="small" color="primary" href="/auth/familysearch/logout">
          Sign Out
        </Button>
      </CardActions>
    </Card>
  )
}

export default SignedInCard
