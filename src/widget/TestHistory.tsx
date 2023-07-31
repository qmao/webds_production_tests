import React, { useEffect } from 'react';

import { Table, IconButton, Chip, Stack } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import LaunchIcon from '@mui/icons-material/Launch';

import { getBackendData, BackendDataType } from './DataModule';

function createData(
    name: string,
    calories: any,
    fat: any,
    carbs: any,
    protein: any
) {
    return { name, calories, fat, carbs, protein };
}

interface IRow {
    name: any;
    fat: any;
    calories: any;
    carbs: any;
}

function DenseTable() {
    const [rows, setRows] = React.useState<IRow[]>([]);
    async function loadHistory() {
        let history: any = [];
        let llist: any = await getBackendData(BackendDataType.BACKEND_LOG_LIST);
        llist.forEach((f: any) => {
            let parts: any = f['name'].split('_');
            let data: any = createData(
                '#' + parts[0],
                parts[3],
                parts[1],
                parts[2],
                ''
            );
            history.push(data);
            setRows(history);
        });
    }

    useEffect(() => {
        loadHistory();
    }, []);

    return (
        <TableContainer
            component={Paper}
            sx={{ borderColor: '#f0f0f0', borderRadius: 0 }}
        >
            <Table sx={{ width: '100%' }} size="small" aria-label="a dense table">
                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableRow>
                        <TableCell>Test ID</TableCell>
                        <TableCell align="center">Test Plan</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Test Time</TableCell>
                        <TableCell align="center">Export</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell align="right">{row.calories}</TableCell>
                            <TableCell align="right">
                                <Chip
                                    sx={{
                                        width: 80,
                                        color:
                                            row.fat === 'pass'
                                                ? '#54de77'
                                                : row.fat === 'fail'
                                                    ? '#e3444f'
                                                    : 'primary',
                                        borderColor:
                                            row.fat === 'pass'
                                                ? '#54de77'
                                                : row.fat === 'fail'
                                                    ? '#e3444f'
                                                    : 'primary'
                                    }}
                                    label={row.fat}
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell align="right">{row.carbs}</TableCell>
                            <TableCell align="right">
                                <IconButton aria-label="delete">
                                    <LaunchIcon fontSize="inherit" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export const TestHistory = (props: any): JSX.Element => {
    return (
        <Stack sx={{ height: 360, overflow: 'auto' }}>
            <DenseTable />
        </Stack>
    );
};

export default TestHistory;
