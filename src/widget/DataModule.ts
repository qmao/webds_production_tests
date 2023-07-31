import {
  GET_TARGET_PLAN_LIST,
  GET_TARGET_PLAN_CASE_LIMITS,
  GET_TARGET_PLAN,
  GET_TARGET_LIB,
  EXPORT_TARGET_PLAN,
  IMPORT_TARGET_PLAN,
  UPDATE_CASE,
  DELETE_CASE,
  DELETE_PLAN,
  CREATE_PLAN,
  GET_LOG_LIST
} from './api';

let latestData: any = {
  test_progress: {
    total: 5,
    current: 0,
    name: 'Reflash'
  },
  test_result: {
    id: undefined,
    r: []
  },
  test_settings: {
    protocol: {
      i2c: '0x2c'
    },
    power: {
      vdd: 0,
      vio: 0,
      vled: 0,
      vbud: 0
    }
  }
};

export const BackendDataType = {
  BACKEND_TEST_PLAN_LIST: 1,
  BACKEND_TEST_PLAN: 2,
  BACKEND_TEST_RESULT: 3,
  BACKEND_TEST_PROGRESS: 4,
  BACKEND_TEST_LIMITS: 5,
  BACKEND_TEST_SETTINGS: 6,
  BACKEND_TEST_LIB: 7,
  BACKEND_TEST_CASE: 8,
  BACKEND_EXPORT_TEST_PLAN: 9,
  BACKEND_IMPORT_TEST_PLAN: 10,
  BACKEND_LOG_LIST: 11
};

export const BackendDataAction = {
  ADD: 0,
  DELETE: 1,
  MODIFY: 2
};

export const DataType = {
  DATA_TEST_RESULT: 1,
  DATA_TEST_PROGRESS: 2,
  DATA_TEST_SETTINGS: 3
};

export function saveData(type: any, data: any): void {
  switch (type) {
    case DataType.DATA_TEST_RESULT:
      latestData.test_result = data;
      console.log('save RESULT', data);
      break;
    case DataType.DATA_TEST_PROGRESS:
      latestData['test_progress'] = data;
      break;
    case DataType.DATA_TEST_SETTINGS:
      latestData['test_settings'] = data;
      break;
    default:
      console.log('TBC');
  }

  //latestData = data;
}

export async function getBackendData(type: any, param?: any): Promise<any> {
  switch (type) {
    case BackendDataType.BACKEND_LOG_LIST:
      return await GET_LOG_LIST();

    case BackendDataType.BACKEND_TEST_PLAN_LIST:
      let plans: any = await GET_TARGET_PLAN_LIST();
      return plans;
    case BackendDataType.BACKEND_TEST_PLAN:
      return await GET_TARGET_PLAN(param);

    case BackendDataType.BACKEND_TEST_LIB:
      let data: any = await GET_TARGET_LIB();
      return data;

    case BackendDataType.BACKEND_TEST_LIMITS:
      //fixme should read from device
      return GET_TARGET_PLAN_CASE_LIMITS(
        param['plan'],
        param['case'],
        param['script']
      );
    case BackendDataType.BACKEND_EXPORT_TEST_PLAN:
      console.log('EXPORT plan', param['path']);
      return await EXPORT_TARGET_PLAN(param['path']['plan']);
  }
  return latestData;
}

export function getData(type: any, param?: any): any {
  switch (type) {
    case DataType.DATA_TEST_PROGRESS:
      return latestData.test_progress;
    case DataType.DATA_TEST_RESULT:
      return latestData.test_result;
    case DataType.DATA_TEST_SETTINGS:
      return latestData.test_settings;
    default:
      console.log('????');
      break;
  }
  return latestData;
}

export async function setBackendData(type: any, param?: any): Promise<any> {
  switch (type) {
    case BackendDataType.BACKEND_TEST_CASE:
      if (param['action'] === BackendDataAction.ADD) {
        let ret: any = await UPDATE_CASE(
          param['plan'],
          param['case'],
          param['data']
        );
        latestData.test_plan = ret.data;
        return ret;
      } else if (param['action'] === BackendDataAction.DELETE) {
        console.log('DELETE CASE--', param);
        let ret: any = await DELETE_CASE(param['plan'], param['case']);
        latestData.test_plan = ret.data;
        return ret;
      }
      return '';
    case BackendDataType.BACKEND_IMPORT_TEST_PLAN:
      return await IMPORT_TARGET_PLAN(param);
    case BackendDataType.BACKEND_TEST_PLAN:
      if (param['action'] === BackendDataAction.ADD) {
        return await CREATE_PLAN(param['plan'], { task: 'create' });
      } else if (param['action'] === BackendDataAction.DELETE) {
        return await DELETE_PLAN(param['plan']);
      }
      break;
  }
  return latestData;
}
