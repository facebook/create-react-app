import React from 'react'
import { css } from '@emotion/core'
import { Button, Card, CardActions, CardContent, CardActionArea } from '@fs/zion-ui'
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
        href="https://www.familysearch.org/frontier/docs"
      >
        Frontier Docs
      </Button>
    </CardActions>
  </Card>
)

export default FrontierDocsCard
