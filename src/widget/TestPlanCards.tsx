import React, { useEffect } from 'react';

import { IconButton, Typography, Paper, Stack, Grid } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadIcon from '@mui/icons-material/Download';

import { CONTROL_STATE } from './constants';

import {
  getBackendData,
  BackendDataType,
  setBackendData,
  BackendDataAction
} from './DataModule';
import { styled } from '@mui/material/styles';

export const StyleButton = styled(IconButton)(({ theme }) => ({
  //border: '1px solid red', // Add border style
  color: theme.palette.primary.dark
}));

const CustomPaper = (props: any) => {
  const [hover, setHover] = React.useState(false);

  const handleMouseEnter = () => {
    // Add your logic for hover enter event
    setHover(true);
  };

  const handleMouseLeave = () => {
    // Add your logic for hover leave event
    setHover(false);
  };

  const onDelete = (event: any, p: any) => {
    let data: any = { plan: p, action: BackendDataAction.DELETE };
    console.log('ON DELETE', p);
    setBackendData(BackendDataType.BACKEND_TEST_PLAN, data).then(
      (data: any) => {
        props.updatePlanList();
        console.log('delete done', data);
      }
    );
    event.stopPropagation();
  };

  const Export = (event: any, p: any) => {
    getBackendData(BackendDataType.BACKEND_EXPORT_TEST_PLAN, {
      path: { plan: p }
    }).then((data: any) => {
      console.log('export done', data);
    });
    event.stopPropagation();
  };

  return (
    <Paper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      elevation={0}
      sx={{
        border: '1px solid lightgray',
        height: 90,
        '&:hover': {
          backgroundColor: '#f5f5fa',
          cursor: 'pointer'
          //borderColor: 'primary.main',
        }
      }}
      onClick={(e) => props.onOpenPlan(e, props.plan)}
    >
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
        sx={{ height: '100%', position: 'relative' }}
      >
        {hover && props.ui.mode === 'dev' && (
          <Stack
            direction="row"
            sx={{
              width: '100%',
              position: 'absolute'
            }}
            justifyContent="flex-end"
            spacing={0.5}
          >
            <StyleButton onClick={(e) => onDelete(e, props.plan)}>
              <DeleteForeverIcon sx={{ fontSize: 16 }} />
            </StyleButton>
            <StyleButton onClick={(e) => Export(e, props.plan)}>
              <DownloadIcon sx={{ fontSize: 16 }} />
            </StyleButton>
          </Stack>
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ height: '100%' }}
        >
          <Typography
            variant="caption"
            display="block"
            sx={{
              color: 'primary.main',
              fontSize: hover ? 14 : 13,
              wordWrap: 'break-word',
              width: '100%',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {props.plan}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export const TestPlanCards = (props: any) => {
  const onOpenPlan = (event: any, p: any) => {
    console.log('on open', p, props.ui.view);

    getBackendData(BackendDataType.BACKEND_TEST_PLAN, p).then((data: any) => {
      let ui: any = JSON.parse(JSON.stringify(props.ui));
      ui.plan = p;
      ui.view = 'plan';
      ui.control = CONTROL_STATE.PAUSE;

      props.onUpdate(ui);
    });
  };

  async function updatePlanList() {
    let plist: any = await getBackendData(
      BackendDataType.BACKEND_TEST_PLAN_LIST
    );
    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.plan_list = plist;
    props.onUpdate(ui);
  }

  useEffect(() => {
    updatePlanList();
  }, []);

  useEffect(() => {
    if (props.ui.plan_list.length === 0) {
      updatePlanList();
    }
    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.case = '';
    ui.plan = '';
    props.onUpdate(ui);
  }, [props.ui]);

  return (
    <Stack sx={{ backgroundColor: '#f5f5f5', p: 1 }}>
      <Typography
        variant="button"
        display="block"
        gutterBottom
        sx={{
          width: '100%',
          textAlign: 'center',
          fontSize: 16
        }}
      >
        Test Plan List
      </Typography>

      <Grid container spacing={2}></Grid>
      <Stack sx={{ height: 20 }} />
      <Grid container spacing={2}>
        {props.ui.plan_list.map((item: any, index: any) => (
          <Grid item xs={4} md={4} lg={4} key={index}>
            <CustomPaper
              plan={item}
              onUpdate={props.onUpdate}
              ui={props.ui}
              onOpenPlan={onOpenPlan}
              updatePlanList={updatePlanList}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};
export default TestPlanCards;
