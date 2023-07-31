import React, { useEffect } from 'react';
import {
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup
} from '@mui/material';

import {
    Typography,
    Stack,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { DataType, saveData } from './DataModule';

export const TestSetSettings = (props: any) => {
    const [settings, setSettings] = React.useState({
        protocol: {
            i2cAddr: null,
            speed: null,
            spi: null
        },
        power: {
            vdd: 0,
            vio: 0,
            vled: 0,
            vbus: 0
        }
    });

    useEffect(() => {
        let s: any = props.ui['sets'].find(
            (element: any) => element.name === props.ui.case
        );
        setSettings(s.settings);
    }, []);

    useEffect(() => {
        saveData(DataType.DATA_TEST_SETTINGS, settings);
    }, [settings]);

    const handleSettingsChange = (event: any) => {
        // Custom event handling logic here
        console.log('Custom change event:', event.target.value, settings);
        let newSettings: any = JSON.parse(JSON.stringify(settings));
        let ss: any = event.target.id.split('-');

        if (newSettings[ss[0]][ss[1]] === undefined) {
            newSettings[ss[0]][ss[1]] = {};
        }

        newSettings[ss[0]][ss[1]] = event.target.value;

        switch (ss[0]) {
            case 'power':
                if (event.target.value > 5000) {
                    //event.target.value = settings[ss[0]][ss[1]].toString();
                    event.target.value = 0;
                } else {
                    newSettings[ss[0]][ss[1]] = Number(newSettings[ss[0]][ss[1]]);
                }
                break;
            case 'protocol':
                if (event.target.value === '') {
                    newSettings[ss[0]][ss[1]] = null;
                    break;
                }

                newSettings[ss[0]][ss[1]] = Number(newSettings[ss[0]][ss[1]]);

                break;
        }
        setSettings(newSettings);
    };

    const handleProtocolChange = (event: any) => {
        //console.log('Custom change event:', event.target.value, settings);

        let newSettings: any = JSON.parse(JSON.stringify(settings));
        if (event.target.value === 'i2c') {
            newSettings.protocol.i2cAddr =
                settings.protocol.i2cAddr === undefined
                    ? null
                    : settings.protocol.i2cAddr;
            delete newSettings.protocol.spi;
        } else if (event.target.value === 'spi') {
            delete newSettings.protocol.i2cAddr;
            newSettings.protocol.spi =
                settings.protocol.spi === undefined ? null : settings.protocol.spi;
        }

        setSettings(newSettings);
    };

    function loadPowerSettings() {
        return (
            <Stack direction="row" spacing={2}>
                {settings !== undefined && (
                    <>
                        <TextField
                            id="power-vdd"
                            label="VDD"
                            variant="standard"
                            type="number"
                            onChange={handleSettingsChange}
                            defaultValue={settings.power.vdd.toString()}
                        />
                        <TextField
                            id="power-vio"
                            label="VIO"
                            variant="standard"
                            type="number"
                            onChange={handleSettingsChange}
                            defaultValue={settings.power.vio.toString()}
                        />
                        <TextField
                            id="power-vled"
                            label="VLED"
                            variant="standard"
                            type="number"
                            onChange={handleSettingsChange}
                            defaultValue={settings.power.vled.toString()}
                        />
                        <TextField
                            id="power-vbus"
                            label="VBUS"
                            variant="standard"
                            type="number"
                            onChange={handleSettingsChange}
                            defaultValue={settings.power.vbus.toString()}
                        />
                    </>
                )}
            </Stack>
        );
    }

    function ProtocolGroup() {
        return (
            <FormControl>
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={settings.protocol.i2cAddr === undefined ? 'spi' : 'i2c'}
                    onChange={handleProtocolChange}
                >
                    <FormControlLabel
                        id="protocol-select-i2c"
                        value="i2c"
                        control={<Radio />}
                        label="I2C"
                    />
                    <FormControlLabel
                        id="protocol-select-spi"
                        value="spi"
                        control={<Radio />}
                        label="SPI"
                    />
                </RadioGroup>
            </FormControl>
        );
    }

    function loadProtocolSettings() {
        return (
            <Stack direction="column" spacing={2}>
                {settings && ProtocolGroup()}
                <Stack direction="row" spacing={5}>
                    {settings && 'i2cAddr' in settings.protocol && (
                        <TextField
                            id="protocol-i2cAddr"
                            label="I2C Address"
                            variant="standard"
                            onChange={handleSettingsChange}
                            defaultValue={settings.protocol.i2cAddr}
                            sx={{ width: 100 }}
                        />
                    )}
                    {settings && 'spi' in settings.protocol && (
                        <TextField
                            id="protocol-spiMode"
                            label="SPI Mode"
                            variant="standard"
                            type="number"
                            onChange={handleSettingsChange}
                            defaultValue={settings.protocol.spi}
                            sx={{ width: 100 }}
                        />
                    )}
                    {settings && (
                        <TextField
                            id="protocol-speed"
                            label="Speed"
                            variant="standard"
                            type="number"
                            onChange={handleSettingsChange}
                            defaultValue={settings.protocol.speed}
                            sx={{ width: 100 }}
                        />
                    )}
                </Stack>
            </Stack>
        );
    }

    return (
        <div>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>Voltage</Typography>

                    <Stack direction="row">
                        {settings !== undefined &&
                            Object.entries(settings.power).map(([key, value]) => (
                                <Chip
                                    label={`${key.toUpperCase()} ${value}`}
                                    variant="outlined"
                                />
                            ))}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>{loadPowerSettings()}</AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>Protocol</Typography>
                    {settings !== undefined &&
                        Object.entries(settings.protocol).map(([key, value]) => (
                            <Chip
                                label={
                                    value === null
                                        ? `${key.toUpperCase()} Default`
                                        : `${key.toUpperCase()} ${value}`
                                }
                                variant="outlined"
                            />
                        ))}
                </AccordionSummary>
                <AccordionDetails>{loadProtocolSettings()}</AccordionDetails>
            </Accordion>
        </div>
    );
};
export default TestSetSettings;
