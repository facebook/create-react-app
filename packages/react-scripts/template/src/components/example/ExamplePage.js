import React from 'react'
import { useUser } from '@fs/zion-user'
import { Grid, Cell } from '@fs/zion-ui'
import FrontierDocsCard from './FrontierDocsCard'
import ZionCard from './ZionCard'
import LearnReactCard from './LearnReactCard'
import NotSignedInCard from './NotSignedInCard'
import ArtifactsCard from './ArtifactsCard'
import UserCard from './UserCard'
import FormCard from './FormCard/FormCard'

// Hook to generate a random color
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

// Component that checks whether or not a user is signed in. If so, it renders
// the Component passed via the `Component` prop and forwards all other props.
// If not signed in, it renders a NotSignedIn component
const RequireSignedInUser = React.memo(({ user, Component, ...props }) =>
  user.signedIn ? <Component user={user} {...props} /> : <NotSignedInCard user={user} />
)

const ExamplePage = () => {
  // Initiate state variables and hooks
  const user = useUser()
  const [logoColor, randomizeLogoColor] = useRandomColor()
  const [likeButtonPressedCount, setLikeButtonPressedCount] = React.useState(0)
  const [logoAnimationDuration, setLogoAnimationDuration] = React.useState(20)

  // Event handlers
  function likeButtonPressed() {
    setLikeButtonPressedCount(currentCount => currentCount + 1)
  }

  function handleLogoAnimationDurationChange(duration) {
    setLogoAnimationDuration(duration)
  }

  return (
    <Grid>
      {/* Row 1 */}
      <Cell>
        <h1>Welcome to your new Frontier Application</h1>
      </Cell>

      {/* Row 2 */}
      <Cell sm="6" lg="4">
        <FrontierDocsCard
          logoColor={logoColor}
          handleLogoClick={randomizeLogoColor}
          animationDuration={logoAnimationDuration}
        />
      </Cell>

      <Cell sm="6" lg="8">
        <ZionCard />
      </Cell>

      {/* Row 3 */}
      <Cell sm="6" lg="8">
        <LearnReactCard />
      </Cell>

      <Cell sm="6" lg="4">
        <RequireSignedInUser
          user={user}
          Component={UserCard}
          likeButtonPressedCount={likeButtonPressedCount}
          logoColor={logoColor}
          logoAnimationDuration={logoAnimationDuration}
          handleLogoAnimationDurationChange={handleLogoAnimationDurationChange}
        />
      </Cell>

      {/* Row 4 */}
      <Cell sm="6" lg="4">
        <RequireSignedInUser
          user={user}
          cisId={user.cisId}
          Component={ArtifactsCard}
          likeButtonPressed={likeButtonPressed}
        />
      </Cell>

      <Cell sm="6" lg="8">
        <FormCard />
      </Cell>
    </Grid>
  )
}
export default ExamplePage
