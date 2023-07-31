import { requestAPI } from '../handler';

export async function runTest(pname: any, dataToSend: any): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0/' + pname;

  const reply = await requestAPI<any>(url, {
    method: 'POST',
    body: JSON.stringify(dataToSend)
  });
  return reply.id;
}

// GET /webds/production_test/log
export async function GET_LOG_LIST(): Promise<any> {
  let url: any = 'pt2/log?query=list';

  const reply = await requestAPI<any>(url, {
    method: 'GET'
  });
  return reply['children'];
}

// GET /webds/production_test/S3908-15.0.0
export async function GET_TARGET_PLAN_LIST(): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0?query=plans';

  const reply = await requestAPI<any>(url, {
    method: 'GET'
  });
  return reply['plans'];
}

// GET /webds/production_test/s3908
export async function GET_TARGET_LIB(): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0?query=lib';

  const reply = await requestAPI<any>(url, {
    method: 'GET'
  });
  return reply;
}

// GET /webds/production_test/s3908/planA
export async function GET_TARGET_PLAN(pname: any): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0/' + pname;

  const reply = await requestAPI<any>(url, {
    method: 'GET'
  });
  return reply;
}

// POST /webds/production_test/s3908/planA/caseA
export async function UPDATE_CASE(
  pname: any,
  cname: any,
  dataToSend: any
): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0/' + pname + '/' + cname;

  const reply = await requestAPI<any>(url, {
    method: 'POST',
    body: JSON.stringify(dataToSend)
  });
  return reply;
}

// DELETE /webds/production_test/s3908/planA/caseA
export async function DELETE_CASE(pname: any, cname: any): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0/' + pname + '/' + cname;

  const reply = await requestAPI<any>(url, {
    method: 'DELETE'
  });
  return reply;
}

// GET /webds/production_test/s3908/planA/caseA/limits
export function GET_TARGET_PLAN_CASE_LIMITS(
  pname: any,
  cname: any,
  sname: any
): any {
  /*
  try {
    let tplan: any = test_plans.find((element: any) => element.name === pname);
    let tcase: any = tplan.cases.find((element: any) => element.name === cname);
    let data: any = limits.find(
      (element: any) => element.name === tcase.limits
    );
    console.log('[GET_TARGET_PLAN_CASE_LIMIT]', data.data);

    return data.data;
  } catch {
    return [];
  }
*/
  return [pname, cname, sname];
}

// POST /webds/production_test/s3908/planA
export async function EXPORT_TARGET_PLAN(pname: any): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0/' + pname;

  let response: any = await requestAPI<any>(url, {
    method: 'POST',
    body: JSON.stringify({ task: 'export' }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/zip' // Specify zip file as the expected response
    }
  });

  const blob = new Blob([response], { type: 'text/plain' });

  const a = document.createElement('a');
  const url_b: any = window.URL.createObjectURL(blob);
  a.href = url_b;
  a.download = 'syna_test_plan_' + pname + '.tar';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url_b);

  return '';
}

// POST /webds/production_test/s3908/planA
export async function IMPORT_TARGET_PLAN(file: any): Promise<any> {
  let url: any = 'pt2/upload';

  console.log('upload hex file:', file);
  const formData = new FormData();
  formData.append('fileToUpload', file);

  try {
    const reply = await requestAPI<any>(url, {
      body: formData,
      method: 'POST'
    });

    return Promise.resolve(reply);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

// POST /webds/production_test/s3908/planA
export async function CREATE_PLAN(pname: any, dataToSend: any): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0/' + pname;

  const reply = await requestAPI<any>(url, {
    method: 'POST',
    body: JSON.stringify(dataToSend)
  });
  return reply;
}

// DELETE /webds/production_test/s3908/planA
export async function DELETE_PLAN(pname: any): Promise<any> {
  let url: any = 'pt2/partnumber/S3908-15.0.0/' + pname;

  const reply = await requestAPI<any>(url, {
    method: 'DELETE'
  });
  return reply;
}

// GET /webds/production_test/s3908/planA/logs/logA
export function GET_LOG(pname: any, log: any, data: any): any {}

// GET /webds/production_test/s3908/planA/logs
export function GET_LOGS(pname: any, data: any): any {}

// DELETE /webds/production_test/s3908/planA/logs/logA
export function DELETE_LOG(pname: any, data: any): any {}

// DELETE /webds/production_test/s3908/planA/logs
export function DELETE_LOGS(pname: any, data: any): any {}
