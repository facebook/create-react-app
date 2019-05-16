import React from 'react'
import { css } from '@emotion/core'
import { Card, CardMedia, CardActions, CardContent, CardActionArea } from '@fs/zion-card'
import Button from '@fs/zion-button'
import ReactImage from './reactjs.jpg'

const cardStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const cardContentStyle = css`
  flex-grow: 1;
`

const LearnReactCard = () => (
  <Card css={cardStyle}>
    <CardActionArea>
      <CardMedia
        css={css`
          height: 240px;
        `}
        zimage="https://s3.amazonaws.com/fswebdev-development/img/reactjs.jpg"
        image={ReactImage}
      />
    </CardActionArea>
    <CardContent css={cardContentStyle}>
      <h2>Learn React</h2>
    </CardContent>
    <CardActions>
      <Button
        variant="text"
        size="small"
        color="primary"
        href="https://reactjs.org/docs/getting-started.html"
      >
        React Docs
      </Button>
      <Button variant="text" size="small" color="primary">
        Earn your Badge
      </Button>
    </CardActions>
  </Card>
)

export default LearnReactCard
