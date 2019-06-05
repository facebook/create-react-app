import React, { useState, lazy } from 'react'
import { Button, Card, CardActions, CardContent } from '@fs/zion-ui'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useCache } from '@fs/zion-cache'
import ListData from './ListData'

// lazy importing EditData, which is depending on whether I'm in editing mode or not.
const EditData = lazy(() => import('./EditData'))

// This is a zion-cache config object. Docs: https://beta.familysearch.org/frontier/zion/?path=/story/utilities-cache--cache-class-api
const cache = { dbName: 'formik', storeName: 'example' }
const key = 'example'

// This is the shape of the data in our form.
// Below, we'll use this same shape for validation
// and formik will use this shape when managing the form.
const initialValue = {
  username: '',
  password: '',
  food: '',
  email: '',
  age: undefined,
  debug: false,
}
const FormCard = () => {
  // useCache is a hook to persist a piece of
  // data in zion-cache. You pass it the zion-cache
  // config, the key where the data is to be stored
  // and an optional initialValue. The api is meant
  // to mimick useState.
  const [cachedData, setCachedData] = useCache({
    cache,
    key,
    initialValue,
  })
  const [isEditing, setIsEditing] = useState(false)

  // Yup is a 3rd party library for validating
  // objects. It has a similar api to prop-types.
  // Docs here: https://www.npmjs.com/package/yup
  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(4, 'Must be at least 4 characters long.')
      .max(15, 'Must be less than 15 characters')
      .required('Username is required'),
    password: Yup.string()
      .min(8, 'Must be at least 8 characters')
      .max(50, 'Too Long!')
      .required('Password is required'),
    email: Yup.string().email('Please enter a valid email'),
    age: Yup.number()
      .min(8)
      .max(65),
    food: Yup.string().max(50),
  })

  return (
    <Card>
      {/* wait for cachedData to exist since formik
        will take use that object for it's dirty and
        validation checking

        Formik is a library to help tame forms in react.
        Docs: https://jaredpalmer.com/formik/
        */}
      {cachedData && (
        <Formik
          validationSchema={validationSchema}
          initialValues={cachedData}
          onSubmit={(values, actions) => {
            setCachedData(values)
            actions.setSubmitting(false)
            setIsEditing(false)
          }}
        >
          {/* formik gives you render props to access values, errors and helper functions
          to deal with your form. */}
          {({ values, errors, touched, handleSubmit, isValid, isDirty, resetForm }) => (
            <>
              <CardContent>
                <h2>Forms in React</h2>
                <p>
                  We recommend <a href="https://jaredpalmer.com/formik/">Formik</a>. It&#39;s really
                  helpful to watch the{' '}
                  <a href="https://jaredpalmer.com/formik/docs/overview#motivation">
                    author&#39;s video
                  </a>{' '}
                  to understand the why.
                </p>
                <h3>Example Form</h3>

                {/* isEditing is a simple boolean state that is toggled by a button below.

                  Errors and values from formik are passed into the EditData component. */}
                {isEditing ? (
                  <EditData touched={touched} errors={errors} values={values} />
                ) : (
                  <ListData data={cachedData} />
                )}
              </CardContent>
              <CardActions>
                {isEditing ? (
                  <>
                    <Button
                      onClick={() => {
                        setIsEditing(editing => !editing)
                        resetForm(cachedData)
                      }}
                      variant="outlined"
                      size="small"
                      color="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!isDirty && !isValid}
                      size="small"
                      color="primary"
                    >
                      Save to Local Cache
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      disabled={cachedData === undefined}
                      onClick={() => {
                        setCachedData(initialValue)
                        resetForm(initialValue)
                      }}
                      variant="outlined"
                      size="small"
                      color="secondary"
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      disabled={cachedData === undefined}
                      onClick={e => {
                        e.preventDefault()
                        setIsEditing(editing => !editing)
                      }}
                      size="small"
                      color="primary"
                    >
                      Edit
                    </Button>
                  </>
                )}
              </CardActions>
            </>
          )}
        </Formik>
      )}
    </Card>
  )
}

// Use React.memo() to keep our component from re-rendering if the props havent changed
// https://reactjs.org/docs/react-api.html#reactmemo
// https://egghead.io/lessons/react-prevent-unnecessary-component-rerenders-with-react-memo
export default React.memo(FormCard)
