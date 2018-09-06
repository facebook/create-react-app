import React from 'react'
import { compose } from 'recompose'
import { inject, observer } from 'mobx-react'

type Props = {}

const Page1 = (props: Props) => {
  const { ExampleStore } = props
  return (
    <div>
      <h1>{ExampleStore.exampleData.text}</h1>
      <h1>Page1 </h1>
    </div>
  )
}


export default compose(
  inject('ExampleStore'),
  observer
)(Page1)