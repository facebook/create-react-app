import React, { useState, lazy } from 'react'
import { Button, Card, CardActions, CardContent } from '@fs/zion-ui'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useCache } from '@fs/zion-cache'
import ListData from './ListData'

const EditData = lazy(() => import('./EditData'))

const cache = { dbName: 'formik', storeName: 'example' }
const key = 'example'
const initialValue = {
  username: '',
  password: '',
  food: '',
  email: '',
  age: undefined,
  debug: false,
}
const FormCard = () => {
  const [cachedData, setCachedData] = useCache({
    cache,
    key,
    initialValue,
  })
  const [isEditing, setIsEditing] = useState(false)
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
          {({ values, errors, handleSubmit, isValid, isDirty, resetForm }) => (
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

                {isEditing ? (
                  <EditData errors={errors} values={values} />
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

export default FormCard
