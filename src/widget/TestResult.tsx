import React, { useEffect, useRef } from 'react';
import { Stack, Typography, Paper, Link } from '@mui/material';
import { getData, DataType } from './DataModule';
import { TEST_RESULT } from './constants';
import { CONTROL_STATE } from './constants';

export const TestResult = (props: any): JSX.Element => {
  const [progress, setProgress] = React.useState(0);
  const [unitWidth, setUnitWidth] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [info, setInfo] = React.useState('');
  const [pid, setPid] = React.useState(undefined);
  const isTesting = useRef(false);
  const CHART_WIDTH = 400;
  const CHART_HEIGHT = 250;

  async function updateChart() {
    setPid(getData(DataType.DATA_TEST_RESULT).id);
    if (!isTesting.current) {
      return;
    }
    let test_progress = getData(DataType.DATA_TEST_PROGRESS);
    setProgress(test_progress.current);
    setInfo(test_progress.name);

    requestAnimationFrame(updateChart);
  }

  useEffect(() => {
    console.log('TEST RESULT UI CHANGE', props.ui.control);
    isTesting.current = false;
    switch (props.ui.control) {
      case CONTROL_STATE.RUN:
        setPid(undefined);
        let test_progress = getData(DataType.DATA_TEST_PROGRESS);
        setUnitWidth(CHART_WIDTH / test_progress.total);
        setTotal(test_progress.total);

        isTesting.current = true;
        updateChart();
        break;
      case CONTROL_STATE.DONE:
        let results: any = getData(DataType.DATA_TEST_RESULT);

        const failed: boolean = results['data'].some(
          (item: any) => item.result === TEST_RESULT.FAIL
        );

        const cancel: boolean = results['data'].some(
          (item: any) => item.result === TEST_RESULT.UNKNOWN
        );

        if (failed) {
          setInfo('FAIL');
        } else if (cancel) {
          setInfo('CANCEL');
        } else {
          setInfo('PASS');
        }
        break;
      case CONTROL_STATE.PAUSE:
        setProgress(0);
        setInfo('');
        break;
      default:
        setInfo('');
        break;
    }
  }, [props.ui]);

  function showResultPanel() {
    let color: any = '#7deb71';
    let width: any = unitWidth;
    if (!isTesting.current) {
      switch (info) {
        case 'FAIL':
          color = 'red';
          width = CHART_WIDTH;
          break;
        case 'PASS':
          break;
        case 'CANCEL':
          color = 'lightgrey';
          width = CHART_WIDTH;
          break;
      }
    }
    if (progress === 0) {
      return (
        <Paper
          elevation={0}
          square
          sx={{
            bgcolor: 'lightgrey',
            width: CHART_WIDTH,
            height: CHART_HEIGHT
          }}
        />
      );
    }
    return Array.from(Array(progress).keys()).map((p: any) => (
      <Paper
        elevation={0}
        square
        sx={{ bgcolor: color, width: width, height: CHART_HEIGHT }}
      />
    ));
  }

  return (
    <Stack alignItems="center" direction="column">
      <Stack direction="row" spacing={1}>
        <Typography variant="h6" sx={{ py: 3 }}>
          {pid === undefined ? 'Generating a new Test ID' : `Test ID:`}
        </Typography>

        {pid !== undefined && (
          <Link
            underline="hover"
            component="button"
            variant="h6"
            onClick={() => {
              console.info("I'm a button.");
            }}
          >
            {pid}
          </Link>
        )}
      </Stack>
      <Stack
        direction="row"
        sx={{
          bgcolor: '#f0f0f0',
          width: CHART_WIDTH,
          p: 0.5,
          position: 'relative'
        }}
        alignItems="center"
        justifyContent="center"
      >
        <Stack sx={{ position: 'absolute' }}>
          <Typography sx={{ fontSize: isTesting.current ? 30 : 60 }}>
            {info}
          </Typography>
        </Stack>
        {isTesting.current && (
          <Stack sx={{ position: 'absolute' }}>
            <Typography sx={{ fontSize: 20, pt: 20 }}>
              {progress} / {total}
            </Typography>
          </Stack>
        )}
        <Stack
          sx={{ width: '100%' }}
          direction="row"
          justifyContent="flex-start"
        >
          {showResultPanel()}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default TestResult;
