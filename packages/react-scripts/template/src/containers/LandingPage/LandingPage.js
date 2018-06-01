import React, { Component } from 'react'
import IconButton from '@material-ui/core/IconButton'
import { injectIntl, intlShape } from 'react-intl'
import { GitHubIcon } from 'rmw-shell/lib/components/Icons'
import Activity from 'rmw-shell/lib/components/Activity'
import Scrollbar from 'rmw-shell/lib/components/Scrollbar'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

const styles = theme => ({
  root: {
    height: '100%'
  },
  hero: {
    height: '100%',
    minHeight: '80vh',
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.type === 'light' ? theme.palette.primary.dark : theme.palette.primary.main
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    letterSpacing: '.7rem',
    textIndent: '.7rem',
    fontWeight: theme.typography.fontWeightLight,
    [theme.breakpoints.only('xs')]: {
      fontSize: 24,
      letterSpacing: '.1em',
      textIndent: '.1rem'
    },
    whiteSpace: 'nowrap'
  },
  headline: {
    paddingLeft: theme.spacing.unit * 4,
    paddingRight: theme.spacing.unit * 4,
    marginTop: theme.spacing.unit,
    maxWidth: 600,
    textAlign: 'center',
    [theme.breakpoints.only('xs')]: {
      fontSize: 18
    }
  },
  content: {
    height: '100%',
    // paddingTop: theme.spacing.unit * 8,
    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing.unit * 12
    }
  },
  button: {
    marginTop: theme.spacing.unit * 3
  },
  logo: {
    color: 'red',
    margin: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 4}px`,
    width: '100%',
    height: '40vw',
    maxHeight: 250
  },
  steps: {
    maxWidth: theme.spacing.unit * 130,
    margin: 'auto'
  },
  step: {
    padding: `${theme.spacing.unit * 3}px ${theme.spacing.unit * 2}px`
  },
  stepIcon: {
    marginBottom: theme.spacing.unit
  },
  markdownElement: {}

})

class LandingPage extends Component {
  render() {
    const { classes, history } = this.props

    return (
      <Activity
        appBarContent={
          <IconButton
            name='github'
            aria-label='Open Github'
            color='inherit'
            href='https://github.com/TarikHuber/react-most-wanted'
            target='_blank'
            rel='noopener'
          >
            <GitHubIcon />
          </IconButton>
        }>

        <Scrollbar>
          <div className={classes.root}>
            <Helmet>
              <title>REACT MOST WANTED</title>
            </Helmet>
            <div className={classes.hero}>
              <div className={classes.content}>
                <img
                  src='/rmw.svg'
                  alt='Material-UI Logo'
                  className={classes.logo}
                />
                <div className={classes.text}>
                  <Typography
                    variant='display2'
                    align='center'
                    component='h1'
                    color='inherit'
                    gutterBottom
                    className={classes.title}
                  >
                    {'REACT MOST WANTED'}
                  </Typography>
                  <Typography
                    variant='headline'
                    component='h2'
                    color='inherit'
                    gutterBottom
                    className={classes.headline}
                  >
                    {'React Starter-Kit with all Most Wanted features.'}
                  </Typography>
                  <Button
                    onClick={() => { history.push('/signin') }}
                    className={classes.button}
                    variant='outlined'
                    color='primary'
                  >
                    {'Get Started'}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </Scrollbar>

      </Activity>
    )
  }
}

LandingPage.propTypes = {
  intl: intlShape.isRequired
}

export default withRouter(injectIntl(withStyles(styles, { withTheme: true })(LandingPage)))
