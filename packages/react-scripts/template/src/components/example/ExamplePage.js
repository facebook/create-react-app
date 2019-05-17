import React from 'react'
import { css } from '@emotion/core'
import { useUser } from '@fs/zion-user'
import { Grid as ZionGrid, Row, Cell } from '@fs/zion-grid'
import axios from '@fs/zion-axios'

import FrontierDocsCard from './FrontierDocsCard'
import ZionCard from './ZionCard'
import LearnReactCard from './LearnReactCard'
import NotSignedInCard from './NotSignedInCard'
import SignedInCard from './SignedInCard'

const Grid = ({ children }) => (
  <ZionGrid>
    <div
      css={css`
        padding: 15px;
      `}
    >
      {children}
    </div>
  </ZionGrid>
)

const useRandomColor = () => {
  const [color, setColor] = React.useState('rgb(0,0,0)')
  const randomize = () => {
    const [r, g, b] = [
      Math.floor(Math.random() * 255) + 1,
      Math.floor(Math.random() * 255) + 1,
      Math.floor(Math.random() * 255) + 1,
    ]
    setColor(`rgb(${r},${g},${b})`)
  }
  return [color, randomize]
}

const ExamplePage = () => {
  const user = useUser()
  const [logoColor, randomizeLogoColor] = useRandomColor()
  const [portrait, setPortrait] = React.useState()

  React.useEffect(() => {
    if (!user.signedIn) return
    axios
      .get(`/service/memories/tree/persons/${user.personId}/portraits/CURRENT`)
      .then(response => setPortrait(response.data.thumbSquareUrl))
  }, [user.personId, user.signedIn])

  function handleFrontierDocsClick() {
    randomizeLogoColor()
  }

  return (
    <Grid>
      <Row>
        <Cell>
          <h1>Welcome to your new Frontier Application</h1>
        </Cell>
      </Row>

      <Row>
        <Cell sm="12" md="6" lg="4">
          <FrontierDocsCard logoColor={logoColor} handleLogoClick={handleFrontierDocsClick} />
        </Cell>
        <Cell sm="12" md="6" lg="8">
          <ZionCard />
        </Cell>
      </Row>

      <Row>
        <Cell sm="12" md="6" lg="8">
          <LearnReactCard />
        </Cell>
        <Cell sm="12" md="6" lg="4">
          {user.signedIn ? (
            <SignedInCard user={user} portrait={portrait} />
          ) : (
            <NotSignedInCard userLoading={userLoading} />
          )}
        </Cell>
      </Row>
    </Grid>
  )
}
export default ExamplePage
