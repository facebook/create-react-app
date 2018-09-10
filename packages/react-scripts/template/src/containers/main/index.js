import React from 'react'
import { compose } from 'recompose'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'

type Props = {
  title?: string
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
`

const Header = styled.h1.attrs({
  isbig: props => (props.isbig ? '3em' : '2em')
})`
  font-size: ${props => props.isbig};
`

const Page1 = (props: Props) => {
  const { ExampleStore, title } = props
  return (
    <Container>
      <Header isbig>{ExampleStore.exampleData.text}</Header>
      <Header>{title} </Header>
    </Container>
  )
}

Page1.defaultProps = {
  title: 'Page1'
}

export default compose(
  inject('ExampleStore'),
  observer
)(Page1)
