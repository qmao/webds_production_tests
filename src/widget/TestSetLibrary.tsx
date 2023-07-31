import React, { useCallback, useEffect, useReducer } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import DeleteIcon from '@mui/icons-material/Delete';
import {
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack
} from '@mui/material';

import { BackendDataType, getBackendData } from './DataModule';

import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

const reducer = (state: any, action: any): any => {
  switch (action.type) {
    case 'SET': {
      return {
        ...state,
        [action.to]: action.from
      };
    }
    case 'COPY': {
      const from = Array.from(state[action.from]);
      const item: any = from[action.fromIndex];
      const to = Array.from(state[action.to]);
      to.splice(action.toIndex, 0, { ...item, id: uuidv4() });
      return {
        ...state,
        [action.from]: from,
        [action.to]: to
      };
    }
    case 'MOVE': {
      const from = Array.from(state[action.from]);
      const [item] = from.splice(action.fromIndex, 1);
      const to = Array.from(state[action.to]);
      to.splice(action.toIndex, 0, item);
      return {
        ...state,
        [action.from]: from,
        [action.to]: to
      };
    }
    case 'REMOVE': {
      const from = Array.from(state[action.from]);
      from.splice(action.fromIndex, 1);
      return {
        ...state,
        [action.from]: from
      };
    }
    case 'REORDER': {
      const from = Array.from(state[action.from]);
      const [item] = from.splice(action.fromIndex, 1);
      const to = from;
      to.splice(action.toIndex, 0, item);
      return {
        ...state,
        [action.to]: to
      };
    }
  }
};

export const TestSetLibrary = (props: any): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, {
    library: [],
    testSet: []
  });
  //const [listHeight, setListHeight] = useState(0);
  //const [dividerHeight, setDividerHeight] = useState(0);
  //const [dividerOffset, setDividerOffset] = useState(0);

  const scripts = React.useRef<string[]>([]);
  const lib = React.useRef<string[]>([]);
  const libDefault = React.useRef<string[]>([]);

  const handleDeleteButtonClick = useCallback(
    (droppableId: string, index: number) => {
      dispatch({
        type: 'MOVE',
        from: 'testSet',
        to: 'library'
      });
    },
    []
  );

  const generateTestSetItems = (set: any, deletable: any): JSX.Element[] => {
    return set.map(({ id, name }: any, index: number) => {
      return (
        <Draggable key={id} draggableId={id} index={index}>
          {(provided: any) => (
            <ListItem
              sx={{ height: 30, fontSize: 10 }}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              divider
              secondaryAction={
                deletable && (
                  <IconButton
                    color="error"
                    edge="end"
                    onClick={() => handleDeleteButtonClick('testSet', index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText primary={name} />
            </ListItem>
          )}
        </Draggable>
      );
    });
  };

  const handleOnDragEnd = (result: any) => {
    if (result.reason !== 'DROP') {
      return;
    }

    if (!result.destination) {
      return;
    }

    let action: string;
    if (result.source.droppableId === result.destination.droppableId) {
      action = 'REORDER';
    } else {
      action = 'MOVE';
    }

    dispatch({
      type: action,
      from: result.source.droppableId,
      fromIndex: result.source.index,
      to: result.destination.droppableId,
      toIndex: result.destination.index
    });
  };

  useEffect(() => {
    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.scripts = state['testSet'];
    props.onUpdate(ui);
  }, [state]);

  function updateSettings() {
    const library = lib.current.map((item: any) => {
      return {
        id: uuidv4(),
        name: item
      };
    });
    dispatch({
      type: 'SET',
      from: library,
      to: 'library'
    });

    const testSet = scripts.current.map((item: any) => {
      return {
        id: uuidv4(),
        name: item
      };
    });
    dispatch({
      type: 'SET',
      from: testSet,
      to: 'testSet'
    });
  }

  function updateDefaultUI() {
    /*
    setDividerOffset(CANVAS_ATTRS.WIDTH / 2);

    let height = 300;
    setDividerHeight(height);

    height -=
      document.getElementById('webds_production_tests_edit_list_label')!
        .clientHeight + 1;
    setListHeight(height);
*/
    updateSettings();
  }

  async function updateDefaultSettings() {
    let libs: any = await getBackendData(BackendDataType.BACKEND_TEST_LIB);

    // get script list
    let c: any = props.ui.plan_data.find((c: any) => c.name === props.ui.case);
    let sl: any = c['scripts'].map((s: any) => {
      return s.name;
    });
    scripts.current = sl;

    let l: any = [...libs['common'], ...libs['lib']];
    libDefault.current = l;

    let newl: any = l.filter((item: any) => !scripts.current.includes(item));
    lib.current = newl;

    updateDefaultUI();
  }

  useEffect(() => {
    updateDefaultSettings();
  }, []);

  const MoveAll = (toLib: any) => {
    if (toLib) {
      lib.current = libDefault.current;
      scripts.current = [];
    } else {
      lib.current = [];
      scripts.current = libDefault.current;
    }
    updateSettings();
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Stack spacing={3} direction="row" sx={{ borderStyle: 'none' }}>
          <List sx={{ width: '50%', padding: '0px' }}>
            <ListItem
              id="webds_production_tests_edit_list_label"
              key={uuidv4()}
              divider
            >
              <ListItemText primary="Library" sx={{ textAlign: 'center' }} />
            </ListItem>
            <Paper
              variant="outlined"
              square
              style={{
                height: 250,
                overflow: 'auto'
              }}
            >
              <Droppable droppableId="library" /*isDropDisabled={true}*/>
                {(provided: any) => (
                  <div
                    style={{
                      height: '100%'
                    }}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {generateTestSetItems(state.library, false)}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Paper>
          </List>
          <Stack spacing={2} justifyContent="center">
            <IconButton
              onClick={() => {
                MoveAll(false);
              }}
            >
              <KeyboardDoubleArrowRightIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                MoveAll(true);
              }}
            >
              <KeyboardDoubleArrowLeftIcon />
            </IconButton>
          </Stack>
          <List sx={{ width: '50%', padding: '0px' }}>
            <ListItem key={uuidv4()} divider>
              <ListItemText
                primary={props.ui.case}
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
            <Paper
              variant="outlined"
              square
              style={{
                height: 250,
                overflow: 'auto'
              }}
            >
              <Droppable droppableId="testSet">
                {(provided: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      height: '100%'
                    }}
                  >
                    {generateTestSetItems(state.testSet, true)}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Paper>
          </List>
        </Stack>
      </DragDropContext>
    </div>
  );
};

export default TestSetLibrary;
