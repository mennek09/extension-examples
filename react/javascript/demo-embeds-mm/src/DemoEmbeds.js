
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
        <Page hasAside>
          <Aside width="12rem">
            <Panels>
              <MenuList {...tabs} width="12rem">
                <MenuItem onClick={() => alert('Ja moin!')} icon={<CrossFilter />}> Tach och</MenuItem>
                <MenuItem onClick={() => alert('Hello world!')} icon={<ColorText />}> Warranty</MenuItem>
                <MenuItem onClick={() => alert('Hello world!')} icon={<VisLine />}>Safety</MenuItem>
                <MenuItem onClick={() => alert('Hello world!')} icon={<DashboardGauge />}>System check</MenuItem>
              </MenuList>
            </Panels>
          </Aside>
          <Section>
            <TabPanels {...tabs} pt="0">
              <TabPanel>
                <DashboardEmbedNext embedType={tabNames[0]} idDashboardMM={230} />
              </TabPanel>

            </TabPanels>
          </Section>
        </Page>
      </View>

    </ComponentsProvider>

  )
}

const View = styled.div`
        width: 100%;
        height: calc(100vh - 50px);
        `
