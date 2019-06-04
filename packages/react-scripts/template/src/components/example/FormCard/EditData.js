import React from 'react'
import { Form, Field, ErrorMessage } from 'formik'
import { Grid, Cell } from '@fs/zion-ui/grid'
import { TextField, Checkbox, FormControlLabel } from '@fs/zion-ui'

export default function Edit({ values, errors, touched }) {
  return (
    <Form>
      <Grid>
        <Cell md="6" lg="4">
          {/* Field comes from formik. In helps with controlling your input (https://reactjs.org/docs/forms.html#controlled-components)
          So within the field render prop, are the onChange and value props that are passed to TextField. */}
          <Field name="username">
            {({ field }) => (
              <>
                {/* TextField is a zion component for text inputs and textareas. */}
                <TextField
                  {...field}
                  error={touched.username && errors.username}
                  id="username"
                  label="Username (required)"
                />
                {/* ErrorMessage is a formik component to help with rendering error messages */}
                <ErrorMessage name="username" render={msg => <p>{msg}</p>} />
              </>
            )}
          </Field>
        </Cell>
        <Cell md="6" lg="4">
          <Field name="password">
            {({ field }) => (
              <>
                <TextField
                  {...field}
                  type="password"
                  error={touched.password && errors.password}
                  id="password"
                  label="Enter a dummy password (required)"
                />
                <ErrorMessage name="password" render={msg => <p>{msg}</p>} />
              </>
            )}
          </Field>
        </Cell>
        <Cell>
          <Field name="food">
            {({ field }) => (
              <>
                <TextField
                  {...field}
                  error={touched.food && errors.food}
                  id="food"
                  label="What&#39;s your favorite food"
                />
                <ErrorMessage name="food" render={msg => <p>{msg}</p>} />
              </>
            )}
          </Field>
        </Cell>
        <Cell md="6" lg="4">
          <Field name="age">
            {({ field }) => (
              <>
                <TextField
                  {...field}
                  type="number"
                  error={touched.age && errors.age}
                  id="age"
                  label="Age"
                />
                <ErrorMessage name="age" render={msg => <p>{msg}</p>} />
              </>
            )}
          </Field>
        </Cell>
        <Cell md="6" lg="4">
          <Field name="email">
            {({ field }) => (
              <>
                <TextField
                  {...field}
                  error={touched.email && errors.email}
                  id="email"
                  label="An Email"
                />
                <ErrorMessage name="email" render={msg => <p>{msg}</p>} />
              </>
            )}
          </Field>
        </Cell>
        <Cell>
          <div>
            <Field name="debug" type="checkbox">
              {({ field }) => (
                <>
                  <FormControlLabel control={<Checkbox {...field} />} label="Debug Formik" />
                </>
              )}
            </Field>
          </div>
        </Cell>
      </Grid>
      {/* This section is helpful to understand a little about what formik is doing to the values and errors in the ui. */}
      {values.debug && <pre>{JSON.stringify({ errors, values }, null, 2)}</pre>}
    </Form>
  )
}
