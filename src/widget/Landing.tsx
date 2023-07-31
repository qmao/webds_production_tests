import React from 'react';

import Stack from '@mui/material/Stack';

import { Canvas } from './mui_extensions/Canvas';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';
import { TestTabs } from './TestTabs';
import { ProductionTestsControl } from './ProductionTestsControl';
import { CONTROL_STATE } from './constants';

export const Landing = (props: any): JSX.Element => {
  const [ui, setUi] = React.useState({
    mode: 'dev',
    //mode: 'op',
    view: 'plans',
    control: CONTROL_STATE.PAUSE,
    plan: '',
    case: '',
    script: '',
    plan_list: [],
    plan_data: undefined,
    case_data: undefined,
    scripts: [],
    sets: []
  });

  const onUpdate = (u: any) => {
    if (JSON.stringify(ui) === JSON.stringify(u) && u.force_update === false) {
      console.log('UPDATE UI SAME RETURN!!!', ui, u);
      return;
    }

    let update: any = JSON.parse(JSON.stringify(u));
    update.force_update = false;
    setUi(update);
    console.log('UPDATE UI@@@@@@@111', update);
  };

  return (
    <>
      <Canvas title={'Production Tests'} sx={{ width: 900 }}>
        <Content sx={{ height: 300 }}>
          <Stack direction="row">
            <TestTabs ui={ui} onUpdate={onUpdate} />
          </Stack>
        </Content>
        <Controls
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ProductionTestsControl onUpdate={onUpdate} ui={ui} />
        </Controls>
      </Canvas>
    </>
  );
};

export default Landing;
