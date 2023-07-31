import React, { useEffect } from 'react';
import {
  Stack,
  Button,
  Paper,
  IconButton,
  ListItem,
  List,
  ListItemButton,
  Typography,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
  TextField,
  Grid,
  Avatar
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';

import {
  getBackendData,
  BackendDataType,
  setBackendData,
  BackendDataAction
} from './DataModule';

const CARD_HEIGHT = 280;

const TestSetPaper = (props: any) => {
  const [open, setOpen] = React.useState(false);
  const handleMouseLeave = () => {
    // Add your logic for hover leave event
    setOpen(false);
  };

  function openSettings(event: any, tcase: any) {
    console.log('open settings', tcase);

    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.case = tcase;
    ui.view = 'settings';
    props.onUpdate(ui);

    event.stopPropagation();
  }

  function openScriptLibrary(event: any, tcase: any) {
    console.log('open library', tcase);

    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.case = tcase;
    ui.view = 'library';
    props.onUpdate(ui);

    event.stopPropagation();
  }

  function renameCase(event: any, tcase: any) {
    let newName: any = 'test123';

    let newCase: any = props.cases.find((c: any) => c.name === tcase);
    newCase.name = newName;
    setBackendData(BackendDataType.BACKEND_TEST_CASE, {
      action: BackendDataAction.ADD,
      plan: props.ui.plan,
      case: tcase,
      data: newCase
    }).then(() => {
      props.updateCasesList();
    });

    event.stopPropagation();
  }

  function deleteSet(event: any, tcase: any) {
    console.log('delete set', tcase);

    setBackendData(BackendDataType.BACKEND_TEST_CASE, {
      action: BackendDataAction.DELETE,
      plan: props.ui.plan,
      case: tcase
    }).then((p: any) => {
      let plan: any = props.ui.plan_data;

      plan = plan.filter((c: any) => c.name !== tcase);

      let ui: any = JSON.parse(JSON.stringify(props.ui));
      ui.plan_data = plan;
      ui.case = '';

      props.onUpdate(ui);
      props.updateCasesList();
    });

    event.stopPropagation();
  }

  return (
    <Paper
      variant="outlined"
      square
      sx={{
        overflow: 'auto',
        '&:hover': {
          backgroundColor: '#f7f3f2',
          cursor: 'pointer',
          borderColor: 'primary.main'
        },
        position: 'relative'
      }}
      onMouseLeave={handleMouseLeave}
    >
      <Stack direction="column" sx={{ height: CARD_HEIGHT }}>
        <Stack
          alignItems="center"
          sx={{ p: 1, position: 'relative', backgroundColor: 'primary.main' }}
        >
          <Avatar
            sx={{
              width: 20,
              height: 20,
              bgcolor: 'primary.main',
              position: 'absolute',
              top: '0%',
              left: '0%',
              border: 1,
              fontSize: 12
            }}
            variant="square"
          >
            {props.index}
          </Avatar>
          <Typography sx={{ color: 'white', fontSize: 16 }}>
            {props.case.name}
          </Typography>
          <IconButton
            sx={{ color: 'white', position: 'absolute', right: 4, top: 2 }}
            onClick={(event) => {
              setOpen(!open);
              event.stopPropagation();
            }}
          >
            <MenuIcon />
          </IconButton>
        </Stack>
        {props.case['scripts'].map((s: any) => {
          return (
            <List disablePadding>
              <ListItem disablePadding alignItems="flex-start">
                <ListItemButton disabled={open} sx={{ px: 1.5 }}>
                  <Typography fontSize={12} sx={{ width: '100%' }}>
                    {s.name}
                  </Typography>
                </ListItemButton>
              </ListItem>
            </List>
          );
        })}
      </Stack>
      {open && (
        <Stack
          sx={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            width: '70%',
            transform: 'translate(-50%, -50%)'
          }}
          spacing={1.5}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={(event) => {
              openSettings(event, props.case.name);
            }}
          >
            Settings
          </Button>
          {props.ui.mode === 'dev' && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={(event) => {
                  openScriptLibrary(event, props.case.name);
                }}
              >
                Update Scripts
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={(event) => deleteSet(event, props.case.name)}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={(event) => renameCase(event, props.case.name)}
              >
                Rename
              </Button>
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
};

export const TestSetCards = (props: any) => {
  const [cases, setCases] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const setName = React.useRef('Test Set 1');

  function getScripts(cs: any) {
    let scripts: any = cs.map((c: any) => c['scripts'].map((s: any) => s));
    return scripts;
  }

  function updateCasesList() {
    let plan: any = props.ui.plan;
    getBackendData(BackendDataType.BACKEND_TEST_PLAN, plan).then(
      (data: any) => {
        let cases: any = JSON.parse(JSON.stringify(data.cases));
        setCases(cases);
        let ui = JSON.parse(JSON.stringify(props.ui));
        ui.plan_data = data.cases;
        ui.case = '';
        ui.sets = cases;
        ui.scripts = getScripts(cases);
        props.onUpdate(ui);
      }
    );
  }
  useEffect(() => {
    updateCasesList();
  }, []);

  function createCase(event: any) {
    let newCase: any = {
      name: setName.current,
      limits: 'limitsMyCase',
      settings: {
        protocol: {
          i2cAddr: null,
          speed: null
        },
        power: {
          vdd: 3300,
          vio: 3300,
          vled: 3300,
          vbus: 3300
        }
      },
      scripts: []
    };

    setBackendData(BackendDataType.BACKEND_TEST_CASE, {
      action: BackendDataAction.ADD,
      plan: props.ui.plan,
      case: newCase['name'],
      data: newCase
    }).then(() => {
      updateCasesList();
    });
  }

  const handleClose = (event: any) => {
    createCase(event);
    setOpenDialog(false);
  };

  function showDialog() {
    return (
      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Create New Test Case'}
        </DialogTitle>
        <DialogContent>
          <TextField
            id="standard-basic"
            label="Test Case Name"
            variant="standard"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setName.current = event.target.value;
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
            }}
          >
            Canel
          </Button>
          <Button onClick={handleClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  return (
    <Grid
      container
      spacing={2}
      sx={{
        position: 'relative',
        backgroundColor: '#f5f5f5',
        p: 1
      }}
    >
      {cases.map((c: any, index: any) => {
        return (
          <Grid item xs={4} md={4} lg={4}>
            <TestSetPaper
              case={c}
              ui={props.ui}
              onUpdate={props.onUpdate}
              updateCasesList={updateCasesList}
              cases={cases}
              index={index}
            />
          </Grid>
        );
      })}

      {props.ui.mode === 'dev' && (
        <Grid item xs={4} md={4} lg={4}>
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{ height: CARD_HEIGHT }}
          >
            <Button
              color="primary"
              aria-label="add"
              sx={{
                width: '100%',
                height: '100%',
                border: `2px dashed lightgrey`
              }}
              onClick={() => {
                setOpenDialog(true);
              }}
            >
              <AddIcon
                sx={{
                  fontSize: 70,
                  //backgroundColor: 'white',
                  borderRadius: '50%'
                  //border: `2px dashed lightgrey`
                }}
              />
            </Button>
          </Stack>
        </Grid>
      )}
      {showDialog()}
    </Grid>
  );
};

export default TestSetCards;
