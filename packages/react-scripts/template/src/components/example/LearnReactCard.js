import React from 'react'
import { css } from '@emotion/core'
import { Button, Card, CardMedia, CardActions, CardContent, CardActionArea } from '@fs/zion-ui'
import ReactImage from './reactjs.jpg'

const cardStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const cardContentStyle = css`
  flex-grow: 1;
`

const mediaCardHeight = css`
height: 240px;
`

const LearnReactCard = () => (
  <Card css={cardStyle}>
    <CardActionArea>
      <CardMedia
        css={mediaCardHeight}
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
      <Button
        href="https://github.com/fs-webdev/skill-building-program/tree/master/badges-active/react"
        variant="text"
        size="small"
        color="primary"
      >
        Earn your Badge
      </Button>
    </CardActions>
  </Card>
)

export default LearnReactCard
