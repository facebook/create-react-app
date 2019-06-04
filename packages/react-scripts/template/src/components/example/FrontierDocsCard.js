import React from 'react'
import { Button, Card, CardActions, CardContent, CardActionArea } from '@fs/zion-ui'
import Logo from './Logo'

const FrontierDocsCard = ({ logoColor, animationDuration, handleLogoClick }) => (
  <Card>
    <CardContent>
      <h2>Getting Started</h2>
      <p>
        Try clicking the wheel to add a splash of color and then check out the code in the example
        directory to get started.
      </p>
    </CardContent>
    <CardActionArea onClick={handleLogoClick}>
      <Logo alt="Click me" color={logoColor} animationDuration={animationDuration} />
    </CardActionArea>

    <CardContent>
      <p>Ready to learn more? Visit the frontier docs.</p>
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
