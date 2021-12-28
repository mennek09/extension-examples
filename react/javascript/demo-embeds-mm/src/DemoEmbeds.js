
import React, { useEffect } from 'react'
import {
  ComponentsProvider,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  useTabs,
  Grid,
  Box2,
  Panels,
  Aside,
  Page,
  onClick
} from '@looker/components'
import styled from 'styled-components'
import { useCurrentRoute, useNavigate } from './hooks'
import { DashboardEmbedNext } from './components/DashboardEmbedNext'
import { DashboardEmbed } from './components/DashboardEmbed'
import { ExploresEmbed } from './components/ExploresEmbed'
import { LooksEmbed } from './components/LooksEmbed'
import { MenuList } from '@looker/components'
import { MenuItem } from '@looker/components'
import { Section } from '@looker/components'

import { CrossFilter, DashboardGauge, ColorText, VisLine } from '@looker/icons'



const tabNames = ['overview']

export const DemoEmbeds = () => {
  const { embedType } = useCurrentRoute()
  const { updateEmbedType } = useNavigate(embedType)
  const tabs = useTabs({
    onChange: (index) => {
      if (tabNames[index] !== embedType) {
        updateEmbedType(tabNames[index])
      }
    },
  })
  const { onSelectTab, selectedIndex } = tabs

  useEffect(() => {
    if (embedType) {
      const routeTabIndex = tabNames.indexOf(embedType)
      if (routeTabIndex > -1 && embedType !== tabNames[selectedIndex]) {
        onSelectTab(routeTabIndex)
      }
    }
  }, [embedType])

  return (
    <ComponentsProvider>
      <View>

        <DashboardEmbedNext embedType={tabNames[0]} />

      </View>

    </ComponentsProvider>

  )
}

const View = styled.div`
        width: 100%;
        height: 100%;
        `
