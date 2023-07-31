import React, { useRef } from 'react';
import {
    Button,
    DialogTitle,
    DialogContent,
    Dialog,
    DialogActions,
    TextField
} from '@mui/material';

export const TestNameDialog = (props: any) => {
    const caseName = useRef(props.default);

    const handleClose = (event: any) => {
        props.onApply(caseName.current);
        props.onClose();
    };

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{'CREATE'}</DialogTitle>
            <DialogContent>
                <TextField
                    id="standard-basic"
                    label={props.label}
                    variant="standard"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        caseName.current = event.target.value;
                    }}
                    defaultValue={caseName.current}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Canel</Button>
                <Button
                    onClick={(e) => {
                        handleClose(e);
                    }}
                    autoFocus
                >
                    OK
        </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TestNameDialog;
