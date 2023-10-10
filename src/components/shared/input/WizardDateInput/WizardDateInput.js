/**
 * Copyright (C) 2019 European Spallation Source ERIC.
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * <p>
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

import { useState } from "react";
import { Button, DialogActions, IconButton, InputAdornment, TextField, styled } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useController } from "react-hook-form";
import { DateTimePicker, pickersLayoutClasses } from "@mui/x-date-pickers";
import { useLocaleText } from "@mui/x-date-pickers/internals";

const DATE_FORMAT = 'YYYY-MM-DD HH:mm';

const CustomActionBar = ({ onAccept, onClear, onCancel, onSetToday, actions, ...other }) => {

    const localeText = useLocaleText();

    if (actions == null || actions.length === 0) {
    return null;
    }

    const buttons = actions?.map((actionType) => {
    switch (actionType) {
        case 'clear':
        return (
            <Button onClick={onClear} key={actionType} variant="contained">
                {localeText.clearButtonLabel}
            </Button>
        );

        case 'cancel':
        return (
            <Button onClick={onCancel} key={actionType} variant="contained" color="secondary">
                {localeText.cancelButtonLabel}
            </Button>
        );

        case 'accept':
        return (
            <Button onClick={onAccept} key={actionType} variant="contained">
                {localeText.okButtonLabel}
            </Button>
        );

        case 'today':
        return (
            <Button onClick={onSetToday} key={actionType} variant="contained" color="secondary">
                {localeText.todayButtonLabel}
            </Button>
        );

        default:
        return null;
    }
    });

    return <DialogActions {...other}>{buttons}</DialogActions>;
}

const ButtonField = ({
    setOpen,
    id,
    disabled,
    InputProps: { ref } = {},
    inputProps: { 'aria-label': ariaLabel } = {}
}) => {
    
    return (
      <IconButton
        variant="outlined"
        id={id}
        disabled={disabled}
        ref={ref}
        aria-label={ariaLabel}
        onClick={() => setOpen?.((prev) => !prev)}
      >
        <CalendarMonthIcon color="primary" />
      </IconButton>
    );
}

const ButtonDatePicker = ({slots, ButtonFieldProps, ...props}) => {

    const [open, setOpen] = useState(false);
  
    return (
        <DateTimePicker
            slots={{ 
                field: ButtonField,
                actionBar: CustomActionBar,
                ...slots
            }} 
            slotProps={{ 
                field: { setOpen, ...ButtonFieldProps},
                actionBar: {
                    actions: ["today", "cancel", "accept"],
                },
                layout: {
                    sx: {
                        [`.${pickersLayoutClasses.actionBar}`]: {
                            button: {
                                
                            },
                            "button:first-child": {
                                marginRight: "auto"
                            }
                        }
                    }
                }
            }}
            open={open}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            format={DATE_FORMAT}
            ampm={false}
            {...props}
        />
    );
}

const WizardDateInput = styled(({name, label, form, rules, defaultValue, onChange, className, DatePickerProps, ...props}) => {

    const {control} = form;
    const {field: {ref, ...field}, fieldState} = useController({name, control, rules, defaultValue});

    const onAccept = (momentDate) => {
        onChange(field, momentDate.format(DATE_FORMAT));
    }

    return (
        <TextField 
            id={name}
            label={label}
            helperText={fieldState?.error?.message}
            error={fieldState?.error}
            inputRef={field.ref}
            InputProps={{
                endAdornment:
                    <InputAdornment position="end">
                        <ButtonDatePicker 
                            onAccept={onAccept} 
                            ButtonFieldProps={{
                                inputProps: {
                                    "aria-label": `Select Absolute ${label ?? "Date/Time"}`
                                }
                            }}
                            {...DatePickerProps}
                        />
                    </InputAdornment>
            }}
            {...field}
            {...props}
        />
    )
})({})

export default WizardDateInput;