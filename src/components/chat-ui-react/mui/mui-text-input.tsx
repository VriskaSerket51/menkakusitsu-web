import { isChatSubmit, isCompositionEnter } from "@/utils/form-keyboard";
import {
  Box,
  Button,
  ButtonProps,
  Icon,
  TextField,
  TextFieldProps,
} from "@mui/material";
import React from "react";

import { ChatController } from "../chat-controller";
import { TextActionRequest, TextActionResponse } from "../chat-types";

export function MuiTextInput({
  chatController,
  actionRequest,
  inputProps,
  buttonProps,
}: {
  chatController: ChatController;
  actionRequest: TextActionRequest;
  inputProps?: TextFieldProps;
  buttonProps?: ButtonProps;
}): React.ReactElement {
  const chatCtl = chatController;
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const sending = React.useRef(false);
  const [value, setValue] = React.useState(actionRequest.defaultValue);

  const setResponse = React.useCallback((): void => {
    if (value?.trim() && !sending.current) {
      sending.current = true;
      const res: TextActionResponse = { type: "text", value };
      try {
        chatCtl.setActionResponse(actionRequest, res);
        setValue("");
        inputRef.current?.focus();
      } finally { queueMicrotask(() => { sending.current = false; }); }
    }
  }, [actionRequest, chatCtl, value]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (isCompositionEnter(e.nativeEvent)) {
        return;
      }

      if (isChatSubmit(e.nativeEvent)) {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
    },
    []
  );

  const sendButtonText = actionRequest.sendButtonText
    ? actionRequest.sendButtonText
    : "Send";

  return (
    <Box
      component="form"
      onSubmit={(event: React.SubmitEvent<HTMLFormElement>) => { event.preventDefault(); setResponse(); }}
      sx={{
        flex: "1 1 auto",
        display: "flex",
        "& > *": {
          flex: "1 1 auto",
          minWidth: 0,
        },
        "& > * + *": {
          ml: 1,
        },
        "& :last-child": {
          flex: "0 1 auto",
        },
      }}
    >
      <TextField
        {...inputProps}
        placeholder={actionRequest.placeholder}
        value={value}
        onChange={(e): void => setValue(e.target.value)}
        inputRef={inputRef}
        autoFocus
        multiline
        variant="outlined"
        maxRows={10}
        slotProps={{
          htmlInput: { onKeyDown: handleKeyDown }
        }}
      />
      <Button
        {...buttonProps}
        type="submit"
        disabled={!value?.trim()}
        startIcon={<Icon>send</Icon>}
      >
        {sendButtonText}
      </Button>
    </Box>
  );
}
