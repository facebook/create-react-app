import React from 'react'
import { css } from '@emotion/core'
import { Button, Card, CardActions, CardContent, CardActionArea } from '@fs/zion-ui'
import Logo from './Logo'

const actionAreaCardAlignment = css`
  text-align: center;
`

const FrontierDocsCard = ({ logoColor, handleLogoClick }) => (
  <Card>
    <CardActionArea onClick={handleLogoClick}>
      <div css={actionAreaCardAlignment}>
        <Logo color={logoColor} />
      </div>
    </CardActionArea>
    <CardContent>
      <h2>Getting Started</h2>
      <p>
        Try clicking the wheel to add a splash of color and then check out the code in the example
        directory to get started.
      </p>
      <p>Wanna to learn more? You can learn more by visiting the frontier docs.</p>
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
