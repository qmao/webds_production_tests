import React, { useEffect } from 'react';

import { Typography, Stack, Breadcrumbs } from '@mui/material';

export const TestPath = (props: any) => {
  useEffect(() => {}, []);

  /*
  function backToHome() {
    let ui: any = JSON.parse(JSON.stringify(props.ui));
    ui.view = 'plans';
    props.onUpdate(ui);
  }
*/
  function BasicBreadcrumbs() {
    let paths: any = [];
    let info: any = JSON.parse(JSON.stringify(props.ui));

    if (info['case'] !== undefined && info['case'] !== '') {
      paths.push(info['case']);
    }
    if (info['script'] !== undefined && info['script'] !== '') {
      paths.push(info['script']);
    }
    return (
      <Stack
        direction="row"
        role="presentation"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{
          pb: 0,
          mb: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Typography
            variant="button"
            display="block"
            gutterBottom
            sx={{ m: 0, fontSize: 16 }}
          >
            {info['plan']}
          </Typography>
          {paths.map((p: any) => (
            <Typography
              variant="button"
              display="block"
              gutterBottom
              sx={{ m: 0, fontSize: 16 }}
            >
              {p}
            </Typography>
          ))}
        </Breadcrumbs>
      </Stack>
    );
  }

  return <Stack>{BasicBreadcrumbs()}</Stack>;
};
export default TestPath;
