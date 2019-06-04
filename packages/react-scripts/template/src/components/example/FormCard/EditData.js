import React from 'react'
import { Form, Field, ErrorMessage } from 'formik'
import { Grid, Cell } from '@fs/zion-ui/grid'
import { TextField, Checkbox, FormControlLabel } from '@fs/zion-ui'

export default function Edit({ values, errors }) {
  return (
    <Form>
      <Grid>
        <Cell md="6" lg="4">
          <Field name="username">
            {({ field }) => (
              <>
                <TextField
                  {...field}
                  error={errors.username}
                  id="username"
                  label="Username (required)"
                />
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
                  error={errors.password}
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
                  error={errors.food}
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
                <TextField {...field} type="number" error={errors.age} id="age" label="Age" />
                <ErrorMessage name="age" render={msg => <p>{msg}</p>} />
              </>
            )}
          </Field>
        </Cell>
        <Cell md="6" lg="4">
          <Field name="email">
            {({ field }) => (
              <>
                <TextField {...field} error={errors.email} id="email" label="An Email" />
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
      {values.debug && <pre>{JSON.stringify({ errors, values }, null, 2)}</pre>}
    </Form>
  )
}
