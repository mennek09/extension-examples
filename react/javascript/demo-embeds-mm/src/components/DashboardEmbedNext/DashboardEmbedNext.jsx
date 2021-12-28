

import React, {
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Layout,
  Page,
  Aside,
  Section,
  MenuItem,
  MenuList,
  MenuHeading,
  Grid,
  SpaceVertical,
  Paragraph,
} from '@looker/components'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { LookerEmbedSDK } from '@looker/embed-sdk'
import {
  useCurrentRoute,
  useNavigate,
  useListenEmbedEvents,
  useAllDashboards,
} from '../../hooks'
import { EmbedContainer } from '../EmbedContainer'


import { CrossFilter, DashboardGauge, ColorText, VisLine, Refresh } from '@looker/icons'

import { DashboardFilter } from '@looker/filter-components'

export const DashboardEmbedNext = ({ embedType }) => {
  const [cancelEvents, setCancelEvents] = useState(true)
  const cancelEventsRef = useRef()
  cancelEventsRef.current = cancelEvents
  const { embedId } = useCurrentRoute(embedType)
  const { updateEmbedId } = useNavigate(embedType)
  const { extensionSDK } = useContext(ExtensionContext2)
  const [message, setMessage] = useState()
  const [running, setRunning] = useState(true)
  const [dashboardId, setDashboardId] = useState()
  const [dashboard, setDashboard] = useState()
  const { embedEvents, listenEmbedEvents, clearEvents } = useListenEmbedEvents()
  const { data, isLoading, error } = useAllDashboards()
  const results = (data || []).map(({ id, title }) => ({
    id,
    description: title,
  }))


  useEffect(() => {
    if (dashboardId && dashboardId !== embedId) {
      if (dashboard) {

        updateEmbedId(dashboardId)
        dashboard.loadDashboard(dashboardId)
        setMessage(undefined)
      }
    }
  }, [dashboardId, embedId, dashboard])

  const maybeCancel = () => {
    return { cancel: cancelEventsRef.current }
  }

  const updateRunButton = (running) => {
    setRunning(running)
  }

  const setupDashboard = (dashboard) => {
    setDashboard(dashboard)
  }

  const embedCtrRef = useCallback((el) => {
    setMessage(undefined)
    if (el) {
      const hostUrl = extensionSDK.lookerHostData?.hostUrl
      if (hostUrl) {
        let initialId
        if (embedId && embedId !== '') {
          setDashboardId(embedId)
          initialId = embedId
        } else {
          initialId = '230'
        }
        LookerEmbedSDK.init(hostUrl)
        const embed = LookerEmbedSDK.createDashboardWithId(initialId)
          .withNext()
          .appendTo(el)
          .on('dashboard:run:start', updateRunButton.bind(null, true))
          .on('dashboard:run:complete', updateRunButton.bind(null, false))
          .on('drillmenu:click', maybeCancel)
          .on('drillmodal:explore', maybeCancel)
          .on('dashboard:tile:explore', maybeCancel)
          .on('dashboard:tile:view', maybeCancel)
        listenEmbedEvents(embed)
        if (initialId === '230') {
          embed.on('page', updateRunButton.bind(null, false))
        }
        embed
          .build()
          .connect()
          .then(setupDashboard)
          .catch((error) => {
            console.error('Connection error', error)
            setMessage('Error setting up embed environment')
          })
      }
    }
  }, [])

  const onSelected = (id) => {
    if (id !== dashboardId) {
      setDashboardId(id)
    }
  }

  const toggleCancelEvents = async (e) => {
    setCancelEvents(e.target.checked)
  }

  const runDashboard = () => {
    if (dashboard) {

      console.log(dashboardId)
      dashboard.run()
    }
  }

  // const setupDashboard = (dashboard) => {
  //   // Add a listener to the "Run All" button and send a 'dashboard:run' message when clicked
  //   const runAllButton = document.querySelector('#run-all')
  //   if (runAllButton) {
  //     runAllButton.addEventListener('click', () => dashboard.run())
  //   }

  //   // Add a listener to the dashboard's "Run" button and send a 'dashboard:run' message when clicked
  //   const runButton = document.querySelector('#run-dashboard')
  //   if (runButton) {
  //     runButton.addEventListener('click', () => dashboard.run())
  //   }

  //   // Add a listener to the dashboard's "Stop" button and send a 'dashboard:stop' message when clicked
  //   const stopButton = document.querySelector('#stop-dashboard')
  //   if (stopButton) {
  //     stopButton.addEventListener('click', () => dashboard.stop())
  //   }

  //   // Add a listener to the state selector and update the dashboard filters when changed
  //   const stateFilter = document.querySelector('#state')
  //   if (stateFilter) {
  //     stateFilter.addEventListener('change', (event) => {
  //       dashboard.updateFilters({
  //         'State / Region': (event.target as HTMLSelectElement).value,
  //       })
  //     })
  //   }
  // }

  const [expression, setExpression] = useState('[0,100]')

  // const componentDidMount() => {
  //   setInterval(() => {
  //     this.setState({
  //       curTime: new Date().toLocaleString()
  //     })
  //   }, 1000)
  // }


  return (
    <Page height="100%%">
      <Layout hasAside height='100%' >
        <Aside height="100%" width="12rem">
          <MenuList height="100%">

            <MenuHeading text-allign="center">Dashboards</MenuHeading>

            <MenuItem onClick={() => onSelected('230')} icon={<CrossFilter />}> Overview</MenuItem>
            <MenuItem onClick={() => onSelected('232')} icon={<ColorText />}> Warranty</MenuItem>
            <MenuItem onClick={() => onSelected('231')} icon={<VisLine />}>Safety</MenuItem>
            <MenuItem onClick={() => onSelected('233')} icon={<DashboardGauge />}>System check</MenuItem>
            <Button
              onClick={runDashboard}
              disabled={!dashboardId || running}
              color="key"
            >
              Reload
            </Button>
            <div>Last action:  {Date().toLocaleString()}</div>
          </MenuList>
          <div position="absolute" ><heading2>User:</heading2><text>ACCURE-EVE</text></div>
        </Aside>

        <Section height="100%">
          <Grid columns="2">
            <SpaceVertical>
              <DashboardFilter
                filter={{
                  field: { is_numeric: true },
                  id: 1,
                  name: 'Age',
                  type: 'field_filter',
                }}
                expression={expression}
                onChange={setExpression}
              />
              <Paragraph>
                <strong>Current filter expression:</strong> {expression}
              </Paragraph>
            </SpaceVertical>

            <DashboardFilter
              expression="34"
              filter={{
                field: {
                  is_numeric: true
                },
                name: 'id filter',
                type: 'field_filter'
              }}
              onChange={function noRefCheck() { }}
            />
          </Grid>
          <EmbedContainer ref={embedCtrRef} />
        </Section>

      </Layout>
    </Page >
  )
}

DashboardEmbedNext.propTypes = {
  embedType: PropTypes.string.isRequired,
  // idDashboardMM: PropTypes.string.isRequired,
}
