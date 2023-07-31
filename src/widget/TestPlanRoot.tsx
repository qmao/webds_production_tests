import React, { useEffect } from 'react';

import { Stack } from '@mui/material';

import { TestPlanCards } from './TestPlanCards';
import { TestSetCards } from './TestSetCards';
import { TestSetSettings } from './TestSetSettings';
import { TestSetLibrary } from './TestSetLibrary';
import { TestResult } from './TestResult';
import { TestPath } from './TestPath';

export const TestPlanRoot = (props: any): JSX.Element => {
  useEffect(() => {}, []);

  const onUpdate = (ui: any) => {
    props.onUpdate(ui);
  };

  return (
    <Stack sx={{ height: 350 }} direction="row">
      <Stack sx={{ width: '100%', padding: 0, overflow: 'auto' }}>
        {props.ui.view !== 'test' && props.ui.view !== 'plans' && (
          <TestPath onUpdate={onUpdate} ui={props.ui} />
        )}
        {props.ui.view === 'plans' && (
          <TestPlanCards onUpdate={onUpdate} ui={props.ui} />
        )}
        {props.ui.view === 'plan' && (
          <TestSetCards onUpdate={onUpdate} ui={props.ui} />
        )}
        {props.ui.view === 'settings' && (
          <TestSetSettings onUpdate={onUpdate} ui={props.ui} />
        )}
        {props.ui.view === 'library' && (
          <TestSetLibrary onUpdate={onUpdate} ui={props.ui} />
        )}
        {props.ui.view === 'test' && (
          <TestResult onUpdate={onUpdate} ui={props.ui} />
        )}
      </Stack>
    </Stack>
  );
};

export default TestPlanRoot;
