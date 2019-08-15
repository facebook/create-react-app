import { Form, Formik } from 'formik';
import React from 'react';
import styled from 'styled-components';
import FlexboxGrid from 'walrus/build/components/FlexboxGrid';
import FloatLabel from 'walrus/build/components/FloatLabel';
import SpinnerButton from 'walrus/build/components/SpinnerButton';
import LoadingState from 'walrus/build/components/states/Loading';
import colors from 'walrus/build/scss/core/_colors.scss';
import * as Yup from 'yup';

const ExamplePage = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
`;

const ExampleGridItem = styled.div`
  background: ${colors.primary};
  min-height: 3rem;
`;

const LoadingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const NameSchema = Yup.object().shape({
  name: Yup.string().required('A value is required!')
});

function App() {
  return (
    <>
      <ExamplePage>
        <FlexboxGrid>
          <FlexboxGrid.Col sm={12} lg={12}>
            <LoadingWrap>
              <LoadingState sammy={true} />
            </LoadingWrap>
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={12} lg={12}>
            <div
              style={{
                width: '600px',
                margin: '100px auto',
                padding: '2em',
                background: `${colors.primary_bg}`
              }}
            >
              <Formik
                initialValues={{
                  name: ''
                }}
                validationSchema={NameSchema}
                onSubmit={(values, actions) => {
                  actions.setSubmitting(true);
                  setTimeout(() => {
                    actions.setSubmitting(false);
                  }, 500);
                }}
                render={({
                  errors,
                  touched,
                  values,
                  isSubmitting,
                  isValid
                }) => (
                  <Form>
                    <FloatLabel
                      placeholder="Enter a name"
                      required={true}
                      name="name"
                      label="Name"
                      error={errors.name}
                      touched={touched.name}
                      value={values.name}
                      autoComplete={'off'}
                    />

                    <SpinnerButton
                      className="do-u-mt--medium"
                      type="submit"
                      primary={true}
                      fullWidth={true}
                      disabled={!isValid || isSubmitting}
                      spinning={isSubmitting}
                    >
                      Submit
                    </SpinnerButton>
                  </Form>
                )}
              />
            </div>
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={12} md={6} lg={4}>
            <ExampleGridItem />
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={12} md={6} lg={8}>
            <ExampleGridItem />
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={12} md={6} lg={7}>
            <ExampleGridItem />
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={12} md={6} lg={5}>
            <ExampleGridItem />
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={6} md={4} lg={2}>
            <ExampleGridItem />
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={6} md={8} lg={10}>
            <ExampleGridItem />
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={12} md={6} lg={5}>
            <ExampleGridItem />
          </FlexboxGrid.Col>
          <FlexboxGrid.Col sm={12} md={6} lg={7}>
            <ExampleGridItem />
          </FlexboxGrid.Col>
        </FlexboxGrid>
      </ExamplePage>
    </>
  );
}

export default App;
