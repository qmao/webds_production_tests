import React, { useEffect } from 'react';
import { Tabs, Stack } from '@mui/material';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { TestPlanRoot } from './TestPlanRoot';

import { TestHistory } from './TestHistory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ px: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

export const TestTabs = (props: any): JSX.Element => {
  const [value, setValue] = React.useState(0);

  useEffect(() => {
    console.log('TABS STATE CHANGE', props.ui);
  }, [props.ui]);

  useEffect(() => {}, []);

  function handleChange(event: React.SyntheticEvent, newValue: number) {
    setValue(newValue);
    let ui: any = JSON.parse(JSON.stringify(props.ui));
    switch (newValue) {
      case 0:
        ui.view = 'plans';
        break;
      case 1:
        ui.view = 'history';
        break;
    }
    props.onUpdate(ui);
  }

  return (
    <Stack sx={{ width: '100%' }} spacing={1}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Test Plan" {...a11yProps(0)} />
          <Tab label="History" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Stack>
          <TestPlanRoot onUpdate={props.onUpdate} ui={props.ui} />
        </Stack>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TestHistory />
      </TabPanel>
    </Stack>
  );
};

export default TestTabs;
