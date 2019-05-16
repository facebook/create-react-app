import React from 'react'
import { css } from '@emotion/core'
import { Card, CardMedia, CardActions, CardContent, CardActionArea } from '@fs/zion-card'
import Button from '@fs/zion-button'
import ZionImage from './zion.jpg'

const cardStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const cardContentStyle = css`
  flex-grow: 1;
`

const ZionCard = () => (
  <Card css={cardStyle}>
    <CardActionArea>
      <CardMedia
        css={css`
          height: 340px;
        `}
        image={ZionImage}
        title="Zion National Park"
      />
    </CardActionArea>
    <CardContent css={cardContentStyle}>
      <h2>Zion</h2>
      <p>Zion is the place to go to find reusable components for your FamilySearch application.</p>
    </CardContent>
    <CardActions>
      <Button
        variant="text"
        size="small"
        color="primary"
        href="https://familysearch.org/frontier/zion"
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
