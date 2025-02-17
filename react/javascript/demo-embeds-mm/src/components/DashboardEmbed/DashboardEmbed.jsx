
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
  ButtonOutline,
  Layout,
  Page,
  Aside,
  Section,
  Space,
  MessageBar,
  Box,
  SpaceVertical,
  FieldToggleSwitch,
  Tooltip,
} from '@looker/components'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { LookerEmbedSDK } from '@looker/embed-sdk'
import {
  useAllDashboards,
  useCurrentRoute,
  useNavigate,
  useListenEmbedEvents,
} from '../../hooks'
import { Search } from '../Search'
import { EmbedContainer } from '../EmbedContainer'
import { EmbedEvents } from '../EmbedEvents'

export const DashboardEmbed = ({ embedType }) => {
  const [cancelEvents, setCancelEvents] = useState(true)
  const cancelEventsRef = useRef()
  cancelEventsRef.current = cancelEvents
  const { embedId } = useCurrentRoute(embedType)
  const { updateEmbedId } = useNavigate(embedType)
  const { extensionSDK } = useContext(ExtensionContext2)
  const [message, setMessage] = useState()
  const [running, setRunning] = useState()
  const [dashboardId, setDashboardId] = useState()
  const [dashboard, setDashboard] = useState()
  const { embedEvents, listenEmbedEvents, clearEvents } = useListenEmbedEvents()
  const { data, isLoading, error } = useAllDashboards()
  const results = (data || []).map(({ id, title }) => ({
    id,
    description: title,
  }))

  useEffect(() => {
    if (dashboardId !== embedId) {
      if (dashboardId && dashboardId !== '') {
        updateEmbedId(dashboardId)
        setMessage(undefined)
      } else {
        if (embedId && embedId !== '') {
          setDashboardId(embedId)
        }
      }
    }
  }, [dashboardId, embedId])

  const maybeCancel = () => {
    return { cancel: cancelEventsRef.current }
  }

  const updateRunButton = (running) => {
    setRunning(running)
  }

  const setupDashboard = (dashboard) => {
    setDashboard(dashboard)
  }

  const embedCtrRef = useCallback(
    (el) => {
      setMessage(undefined)
      if (dashboardId) {
        if (el) {
          setRunning(true)
          el.innerHTML = ''
          const hostUrl = extensionSDK.lookerHostData?.hostUrl
          if (hostUrl) {
            LookerEmbedSDK.init(hostUrl)
            const embed = LookerEmbedSDK.createDashboardWithId(dashboardId)
              .appendTo(el)
              .on('dashboard:run:start', updateRunButton.bind(null, true))
              .on('dashboard:run:complete', updateRunButton.bind(null, false))
              .on('explore:state:changed', updateRunButton.bind(null, false))
              .on('drillmenu:click', maybeCancel)
              .on('drillmodal:explore', maybeCancel)
              .on('dashboard:tile:explore', maybeCancel)
              .on('dashboard:tile:view', maybeCancel)
            listenEmbedEvents(embed)
            embed
              .build()
              .connect()
              .then(setupDashboard)
              .catch((error) => {
                console.error('Connection error', error)
                setMessage('Error loading embed')
              })
          }
        }
      }
    },
    [dashboardId]
  )

  const onSelected = (id) => {
    if (id !== dashboardId) {
      // updateRunButton(true)
      setDashboardId(id)
    }
  }

  const toggleCancelEvents = async (e) => {
    setCancelEvents(e.target.checked)
  }

  const loadDashboard = () => {
    if (dashboard) {
      console.log('Hallo')
      dashboard.run()
    }
  }

  return (
    <Page height="100%">
      <Layout hasAside height="100%">
        <Section height="100%" px="small">
          <>
            {message && <MessageBar intent="critical">{message}</MessageBar>}
            <Box py="5px">
              <Space>
                <Button
                  onClick={loadDashboard}
                  disabled={!dashboardId || running}
                >
                  Ja moin
                </Button>

                <Tooltip content="Unlocks the dashboard search tile if the dashboard run does not complete in a reasonable amount of time.">
                  <ButtonOutline
                    onClick={updateRunButton.bind(null, false)}
                    disabled={!running}
                  >
                    Unlock dashboard search
                  </ButtonOutline>
                </Tooltip>
                <FieldToggleSwitch
                  label="Cancel embed events"
                  onChange={toggleCancelEvents}
                  on={cancelEvents}
                />
              </Space>
            </Box>
            <EmbedContainer ref={embedCtrRef} />
          </>
        </Section>
        <Aside width="25%" height="100%" pr="small">
          <SpaceVertical height="100%">
            <Search
              onSelected={onSelected}
              loading={isLoading}
              error={error}
              data={results}
              embedRunning={running}
            />
            <EmbedEvents events={embedEvents} clearEvents={clearEvents} />
          </SpaceVertical>
        </Aside>
      </Layout>
    </Page >
  )
}

DashboardEmbed.propTypes = {
  embedType: PropTypes.string.isRequired,
}
