import React, { useEffect, useState, useRef } from 'react';

import { Fab, Stack, Button, IconButton, Grid } from '@mui/material';

import { TestNameDialog } from './TestNameDialog';
import AddIcon from '@mui/icons-material/Add';
import BackupIcon from '@mui/icons-material/Backup';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

import {
  getData,
  saveData,
  DataType,
  getBackendData,
  BackendDataType,
  setBackendData,
  BackendDataAction
} from './DataModule';

import { TEST_RESULT, CONTROL_STATE } from './constants';
import { styled } from '@mui/material/styles';
import { runTest } from './api';
import HomeIcon from '@mui/icons-material/Home';

export const GeneralButton = styled(Button)(({ theme }) => ({
  //border: '1px solid red', // Add border style
  backgroudColor: theme.palette.primary.dark,
  width: 180
}));

const BlinkingIcon = styled(Fab)({
  animation: 'blinking 1s infinite',
  '@keyframes blinking': {
    '0%': {
      opacity: 0.2
    },
    '50%': {
      opacity: 1
    },
    '100%': {
      opacity: 0.2
    }
  }
});

export const ProductionTestsControl = (props: any): JSX.Element => {
  const ICON_SIZE = '2rem';
  const tests = useRef([]);
  const [sse, setSse] = useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const controlState = useRef(CONTROL_STATE.PAUSE);

  const eventSource = useRef<undefined | EventSource>(undefined);
  const eventError = useRef(false);
  const eventType = 'production-tests';
  const eventRoute = 'http://localhost:8889/webds/pt2';

  useEffect(() => {
    if (sse) {
      removeEvent();
      let ui: any = JSON.parse(JSON.stringify(props.ui));
      controlState.current = CONTROL_STATE.DONE;
      ui.view = 'test';
      ui.control = controlState.current;
      props.onUpdate(ui);
    }
    setSse(false);
  }, [sse]);

  const eventHandler = (event: any) => {
    const data = JSON.parse(event.data);
    let index: any = Number(data.index);

    let name: string = data.name.replace(/^test_\d+_/i, '');

    saveData(DataType.DATA_TEST_PROGRESS, {
      total: tests.current.length,
      current: index,
      name: name
    });

    switch (data.status) {
      case 'started':
        break;
      case 'done':
        let results: any = getData(DataType.DATA_TEST_RESULT);
        results['data'][index - 1].result = data.result;
        results['data'][index - 1].script = name;
        saveData(DataType.DATA_TEST_RESULT, results);
        if (
          data.result === TEST_RESULT.FAIL ||
          index === tests.current.length
        ) {
          setSse(true);
        }
        break;
    }
  };

  const removeEvent = () => {
    const SSE_CLOSED = 2;
    if (eventSource.current && eventSource.current!.readyState !== SSE_CLOSED) {
      eventSource.current!.removeEventListener(eventType, eventHandler, false);
      eventSource.current!.close();
      eventSource.current = undefined;
    }
  };

  const errorHandler = (error: any) => {
    eventError.current = true;
    removeEvent();
    console.error(`Error on GET ${eventRoute}\n${error}`);
  };

  const addEvent = () => {
    if (eventSource.current) {
      return;
    }
    eventError.current = false;
    eventSource.current = new window.EventSource(eventRoute);
    eventSource.current!.addEventListener(eventType, eventHandler, false);
    eventSource.current!.addEventListener('error', errorHandler, false);
  };

  function setTestData() {
    let data: any = [];
    tests.current.forEach((t: any) => {
      data.push({
        plan: t.plan,
        case: t.case,
        script: t.script,
        result: TEST_RESULT.UNKNOWN
      });
    });
    let result: any = getData(DataType.DATA_TEST_RESULT, data);
    result.data = data;
    saveData(DataType.DATA_TEST_RESULT, result);
  }

  useEffect(() => {
    console.log('CONTROL STATE CHANGE', props.state);
  }, [props.state]);

  useEffect(() => {
    return () => {
      removeEvent();
    };
  }, []);

  function changeToView(v: any) {
    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.view = v;
    props.onUpdate(ui);
    console.log('CHANGE TO VEIW', ui);
  }

  function setUpTest() {
    getBackendData(BackendDataType.BACKEND_TEST_PLAN, props.ui.plan)
      .then((p: any) => {
        let all: any = [];
        p['cases'].forEach((c: any) => {
          let l: any = c['scripts'].map((s: any) => {
            return s.name;
          });
          all = [...all, ...l];
        });
        tests.current = all;

        saveData(DataType.DATA_TEST_PROGRESS, {
          total: tests.current.length,
          current: 0,
          name: ''
        });

        if (tests.current.length === 0) {
          throw new Error('No Test script');
        }
        setTestData();
      })
      .then(() => {
        controlState.current = CONTROL_STATE.RUN;
        let ui: any = JSON.parse(JSON.stringify(props.ui));
        ui.control = controlState.current;
        ui.view = 'test';
        props.onUpdate(ui);

        addEvent();
        return runTest(ui.plan, { task: 'run' });
      })
      .then((id) => {
        let results: any = getData(DataType.DATA_TEST_RESULT);
        results.id = id;
        saveData(DataType.DATA_TEST_RESULT, results);
      })
      .catch((e: any) => {
        removeEvent();
        alert(e.toString());
      });

    let results: any = getData(DataType.DATA_TEST_RESULT);
    results.id = undefined;
    saveData(DataType.DATA_TEST_RESULT, results);
  }

  function updateTestCase(data: any) {
    setBackendData(BackendDataType.BACKEND_TEST_CASE, {
      action: BackendDataAction.ADD,
      plan: props.ui.plan,
      case: props.ui.case,
      data: data
    }).then(() => {
      let ui: any = JSON.parse(JSON.stringify(props.ui));
      ui.plan_data = data;
      props.onUpdate(ui);
      changeToView('plan');
    });
  }

  const mode = {
    DONE: 0,
    READY: 1,
    RUN: 2,
    CANCEL: 3
  };

  const changeTestMode = (m: any) => {
    console.log('TEST CLICK!!!!!!!', m, controlState.current);

    switch (m) {
      case mode.DONE:
        controlState.current = CONTROL_STATE.DONE;
        break;
      case mode.READY:
      case mode.CANCEL:
        controlState.current = CONTROL_STATE.PAUSE;
        break;
      case mode.RUN:
        controlState.current = CONTROL_STATE.RUN;
        break;
      default:
        break;
    }

    switch (controlState.current) {
      case CONTROL_STATE.DONE:
        changeToView('plan');
        break;
      case CONTROL_STATE.RUN:
        setUpTest();
        break;
      case CONTROL_STATE.PAUSE:
        setSse(true);
        changeToView('test');
        break;
      default:
        break;
    }
  };

  const onClickLibraryApply = () => {
    let scripts: any = props.ui.scripts;
    let newS: any = scripts.map((s: any) => {
      return { name: s.name, time: '???' };
    });

    let plan: any = props.ui.plan_data;
    let c: any = plan.find((c: any) => c.name === props.ui.case);
    c['scripts'] = newS;

    updateTestCase(c);
  };

  function showIcon(control: any) {
    switch (control) {
      case CONTROL_STATE.PAUSE:
        return <PlayArrowIcon sx={{ fontSize: ICON_SIZE, color: 'white' }} />;
      case CONTROL_STATE.RUN:
        return <BlinkingIcon sx={{ fontSize: ICON_SIZE, color: 'white' }} />;
      case CONTROL_STATE.DONE:
        return <DoneOutlineIcon sx={{ fontSize: ICON_SIZE, color: 'white' }} />;
      default:
        break;
    }
  }

  function updatePlanList(pl: any) {
    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.plan_list = pl;
    props.onUpdate(ui);
  }

  const Import = (event: any, f: any) => {
    console.log('import');
    setBackendData(BackendDataType.BACKEND_IMPORT_TEST_PLAN, f)
      .then((data: any) => {
        console.log('import done 1', data['plan']);
        updatePlanList(data['plans']);
      })
      .catch((e) => {
        alert(e);
      });
  };

  const handleFileUpload = (e: any) => {
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];
    if (file === undefined) {
      return;
    }

    Import(e, file);
  };

  function createPlan(name: any) {
    console.log('Create plan name', name);
    setOpenDialog(false);

    setBackendData(BackendDataType.BACKEND_TEST_PLAN, {
      plan: name,
      action: BackendDataAction.ADD
    })
      .then((data: any) => {
        console.log('create done', data);
        updatePlanList(data['plans']);
      })
      .catch((e: any) => {
        alert(e);
      });
  }

  function showControl() {
    let ui: any = JSON.parse(JSON.stringify(props.ui));

    console.log('CONTROL:', ui);

    switch (props.ui.view) {
      case 'plans':
        return (
          <Stack direction="row" spacing={4}>
            {props.ui.mode === 'dev' && (
              <Button
                onClick={(e) => {
                  setOpenDialog(true);
                }}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ width: 200 }}
              >
                NEW TEST PLAN
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<BackupIcon />}
              sx={{ width: 200 }}
              component="label"
            >
              <input
                type="file"
                accept=".tar"
                hidden
                onChange={handleFileUpload}
                onClick={(event: any) => {
                  event.target.value = null;
                }}
              />
              IMPORT RECIPE
            </Button>
          </Stack>
        );
      case 'history':
        return <></>;

      case 'plan':
        return (
          <>
            <GeneralButton
              disabled={
                props.ui.sets.length === 0 || props.ui.scripts.length === 0
              }
              variant="contained"
              onClick={() => {
                changeTestMode(mode.RUN);
              }}
            >
              Run All Sets
            </GeneralButton>
          </>
        );
      case 'settings':
        return (
          <Stack direction="row" spacing={4}>
            <GeneralButton
              variant="contained"
              onClick={() => {
                changeToView('plan');
              }}
            >
              Cancel
            </GeneralButton>
            <GeneralButton
              variant="contained"
              onClick={() => {
                let plan: any = props.ui.plan_data;
                let settings: any = getData(DataType.DATA_TEST_SETTINGS);
                let data: any = plan.find((c: any) => c.name === props.ui.case);
                data['settings'] = settings;
                updateTestCase(data);
              }}
            >
              Apply
            </GeneralButton>
          </Stack>
        );
      case 'library':
        return (
          <Stack direction="row" spacing={4}>
            <GeneralButton
              variant="contained"
              onClick={() => {
                changeToView('plan');
              }}
            >
              Cancel
            </GeneralButton>
            <GeneralButton
              variant="contained"
              onClick={() => {
                onClickLibraryApply();
              }}
            >
              Apply
            </GeneralButton>
          </Stack>
        );
    }

    switch (controlState.current) {
      case CONTROL_STATE.LIB:
        return (
          <Stack direction="row" spacing={5}>
            <GeneralButton variant="contained" onClick={onClickLibraryApply}>
              Apply
            </GeneralButton>
            <GeneralButton
              variant="contained"
              onClick={() => {
                changeTestMode(mode.CANCEL);
              }}
            >
              Cancel
            </GeneralButton>
          </Stack>
        );
      case CONTROL_STATE.RUN:
        return (
          <Fab
            size="large"
            aria-label="edit"
            sx={{
              width: '60px',
              height: '60px',
              bgcolor: 'primary.main'
            }}
            onClick={() => {
              if (controlState.current === CONTROL_STATE.RUN) {
                changeTestMode(mode.CANCEL);
              } else {
                changeTestMode(mode.RUN);
              }
            }}
          >
            {showIcon(controlState.current)}
          </Fab>
        );
      case CONTROL_STATE.PAUSE:
        return (
          <Fab
            size="large"
            aria-label="edit"
            sx={{
              width: '60px',
              height: '60px',
              bgcolor: 'primary.main'
            }}
            onClick={() => changeTestMode(mode.READY)}
          >
            {showIcon(ui.control)}
          </Fab>
        );
      case CONTROL_STATE.DONE:
        return (
          <Stack direction="row" spacing={4}>
            <Button
              variant="outlined"
              sx={{ width: 150 }}
              onClick={() => {
                setUpTest();
              }}
            >
              Re-Test
            </Button>
            <Button
              variant="outlined"
              sx={{ width: 150 }}
              onClick={() => {
                changeToView('plan');
              }}
            >
              Done
            </Button>
          </Stack>
        );
      default:
        return null;
    }
  }

  function backToHome(event: any) {
    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.view = 'plans';
    props.onUpdate(ui);
  }

  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid item xs={1} md={1} lg={1}>
        <Stack alignItems="center">
          {props.ui.view !== 'history' &&
            props.ui.view !== 'plans' &&
            props.ui.view !== 'test' &&
            props.ui.view !== 'library' && (
              <IconButton color="primary" onClick={(e: any) => backToHome(e)}>
                <HomeIcon />
              </IconButton>
            )}
        </Stack>
      </Grid>
      <Grid item xs={10} md={10} lg={10}>
        <Stack alignItems="center">{showControl()}</Stack>
      </Grid>
      <Grid item xs={1} md={1} lg={1}></Grid>
      <TestNameDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
        onApply={createPlan}
        default="MyTestPlan"
        label="Test Plan Name"
      />
    </Grid>
  );
};

export default ProductionTestsControl;
