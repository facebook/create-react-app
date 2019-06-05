import React from 'react'
import { Button, Card, CardMedia, CardActions, CardContent } from '@fs/zion-ui'
import ReactImage from './reactjs.jpg'

const LearnReactCard = () => (
  <Card>
    <CardMedia height="300px" image={ReactImage} />
    <CardContent>
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

// Use React.memo() to keep our component from re-rendering if the props havent changed
// https://reactjs.org/docs/react-api.html#reactmemo
// https://egghead.io/lessons/react-prevent-unnecessary-component-rerenders-with-react-memo
export default React.memo(LearnReactCard)
