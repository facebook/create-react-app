import React from 'react'
import { css } from '@emotion/core'
import { Card, CardActions, CardContent, CardActionArea } from '@fs/zion-card'
import Button from '@fs/zion-button'
import Logo from './Logo'

const cardStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const cardContentStyle = css`
  flex-grow: 1;
`

const FrontierDocsCard = ({ logoColor, handleLogoClick }) => (
  <Card css={cardStyle}>
    <CardActionArea onClick={handleLogoClick}>
      <div
        css={css`
          text-align: center;
        `}
      >
        <Logo color={logoColor} />
      </div>
    </CardActionArea>
    <CardContent css={cardContentStyle}>
      <h2>Getting Started</h2>
      <p>Ready to get started? You can learn more by visiting the frontier docs.</p>
    </CardContent>
    <CardActions>
      <Button
        variant="text"
        size="small"
        color="primary"
        href="https://familysearch.org/frontier/docs"
      >
        Frontier Docs
      </Button>
    </CardActions>
  </Card>
)

export default FrontierDocsCard
