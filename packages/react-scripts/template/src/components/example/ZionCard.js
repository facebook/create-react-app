import React from 'react'
import { Button, Card, CardMedia, CardActions, CardContent } from '@fs/zion-ui'
import ZionImage from './zion.jpg'

const ZionCard = () => (
  <Card>
    <CardMedia height="340px" image={ZionImage} title="Zion National Park" />
    <CardContent>
      <h2>Zion</h2>
      <p>Zion is the place to go to find reusable components for your FamilySearch application.</p>
    </CardContent>
    <CardActions>
      <Button
        variant="text"
        size="small"
        color="primary"
        href="https://beta.familysearch.org/frontier/zion"
      >
        Components
      </Button>
      <Button variant="text" size="small" color="primary" href="https://github.com/fs-webdev/zion">
        Github
      </Button>
    </CardActions>
  </Card>
)

export default ZionCard
