import Button from '@material-ui/core/Button'
import CountUp from 'react-countup'
import Group from '@material-ui/icons/Group'
import React, { Component } from 'react'
import { Activity } from 'rmw-shell'
import { GitHubIcon } from 'rmw-shell/lib/components/Icons'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withFirebase } from 'firekit-provider'
import { withTheme } from '@material-ui/core/styles'
import Scrollbar from 'rmw-shell/lib/components/Scrollbar'

const currentYear = new Date().getFullYear()
const daysPath = `/user_registrations_per_day/${currentYear}/${new Date().toISOString().slice(5, 7)}`
const monthsPath = `/user_registrations_per_month/${currentYear}`
const providerPath = '/provider_count'

class Dashboard extends Component {
  componentDidMount() {
    const { watchPath } = this.props

    watchPath(daysPath)
    watchPath(monthsPath)
    watchPath(providerPath)
    watchPath('users_count')
  }

  render() {
    const { theme, intl, days, months, providers, usersCount } = this.props

    let daysLabels = []
    let daysData = []

    if (days) {
      Object.keys(days)
        .sort()
        .map(key => {
          daysLabels.push(key)
          daysData.push(days[key])
          return key
        })
    }

    const daysComponentData = {
      labels: daysLabels,
      datasets: [
        {
          label: intl.formatDate(Date.now(), { month: 'long' }),
          fill: false,
          lineTension: 0.1,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: theme.palette.secondary.main,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: theme.palette.primary.main,
          pointHoverBorderColor: theme.palette.secondary.main,
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: daysData
        }
      ]
    }

    let monthsLabels = []
    let monthsData = []

    if (months) {
      Object.keys(months)
        .sort()
        .map(key => {
          let date = new Date(`${currentYear}-${key}-1`)
          monthsLabels.push(intl.formatDate(date, { month: 'long' }))

          monthsData.push(months[key])
          return key
        })
    }

    const monthsComponentData = {
      labels: monthsLabels,
      datasets: [
        {
          label: intl.formatMessage({ id: 'user_registrationg_graph_label' }),
          fill: false,
          maintainAspectRatio: true,
          lineTension: 0.1,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: theme.palette.secondary.main,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: theme.palette.primary.main,
          pointHoverBorderColor: theme.palette.secondary.main,
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: monthsData
        }
      ]
    }

    let providersData = []
    let providersLabels = []
    let providersBackgrounColors = []

    if (providers) {
      Object.keys(providers)
        .sort()
        .map(key => {
          providersLabels.push(intl.formatMessage({ id: key }))
          providersBackgrounColors.push(intl.formatMessage({ id: `${key}_color` }))
          providersData.push(providers[key])
          return key
        })
    }

    const providersComponentData = {
      labels: providersLabels,
      datasets: [
        {
          data: providersData,
          backgroundColor: providersBackgrounColors,
          hoverBackgroundColor: providersBackgrounColors
        }
      ]
    }

    return (
      <Activity
        iconElementRight={
          <Button
            style={{ marginTop: 4 }}
            href="https://github.com/TarikHuber/react-most-wanted"
            target="_blank"
            rel="noopener"
            secondary
            icon={<GitHubIcon />}
          />
        }
        title={intl.formatMessage({ id: 'dashboard' })}
      >
        <Scrollbar>
          <div
            style={{
              margin: 5,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginTop: 50
            }}
          >
            <div style={{ flexGrow: 1, flexShrink: 1, maxWidth: 600 }}>
              <Line
                options={{
                  maintainAspectRatio: true
                }}
                data={monthsComponentData}
              />
            </div>

            <div style={{ flexGrow: 1, flexShrink: 1, maxWidth: 600 }}>
              <Bar
                options={{
                  maintainAspectRatio: true
                }}
                data={daysComponentData}
              />
            </div>
          </div>

          <br />
          <div
            style={{
              margin: 5,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginTop: 50
            }}
          >
            <div style={{ flexGrow: 1, flexShrink: 1, maxWidth: 600, justifyContent: 'center' }}>
              <Doughnut data={providersComponentData} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 30 }}>
              <CountUp
                style={{
                  fontSize: 100,
                  color: theme.palette.primary.main,
                  fontFamily: theme.fontFamily
                }}
                start={0}
                end={usersCount}
              />
              <div>
                <Group color="secondary" className="material-icons" style={{ fontSize: 70, marginLeft: 16 }} />
              </div>
            </div>
          </div>
        </Scrollbar>
      </Activity>
    )
  }
}

const mapStateToProps = state => {
  const { paths } = state

  return {
    days: paths[daysPath],
    months: paths[monthsPath],
    providers: paths[providerPath],
    usersCount: paths['users_count'] ? paths['users_count'] : 0
  }
}

export default connect(mapStateToProps)(injectIntl(withTheme(withFirebase(Dashboard))))
