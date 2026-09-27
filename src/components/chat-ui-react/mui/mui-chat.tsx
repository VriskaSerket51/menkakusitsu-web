import { Box, ButtonProps, TextFieldProps } from "@mui/material";
import dayjs from "dayjs";
import React from "react";

import { ChatController } from "../chat-controller";
import type { TextActionRequest } from "../chat-types";

import { MuiMessage } from "./mui-message";
import { MuiTextInput } from "./mui-text-input";

export function MuiChat({
  chatController,
  textInputProps,
  submitButtonProps,
}: React.PropsWithChildren<{
  chatController: ChatController;
  textInputProps?: TextFieldProps;
  submitButtonProps?: ButtonProps;
}>): React.ReactElement {
  const chatCtl = chatController;
  const [messages, setMessages] = React.useState(chatCtl.getMessages());
  const [actReq, setActReq] = React.useState(chatCtl.getActionRequest());

  const msgRef = React.useRef<HTMLDivElement>(null);
  const scroll = React.useCallback((): void => {
    if (msgRef.current) {
      msgRef.current.scrollTop = msgRef.current.scrollHeight;
    }
  }, [msgRef]);
  React.useEffect(() => {
    function handleMessagesChanged(): void {
      setMessages([...chatCtl.getMessages()]);
      scroll();
    }
    function handleActionChanged(): void {
      setActReq(chatCtl.getActionRequest());
      scroll();
    }
    chatCtl.addOnMessagesChanged(handleMessagesChanged);
    chatCtl.addOnActionChanged(handleActionChanged);
    return () => {
      chatCtl.removeOnMessagesChanged(handleMessagesChanged);
      chatCtl.removeOnActionChanged(handleActionChanged);
    };
  }, [chatCtl, scroll]);

  const unknownMsg = {
    type: "text",
    content: "Unknown message.",
    self: false,
  };

  let prevDate = dayjs(0);
  let prevTime = dayjs(0);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        p: 1,
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        "& > *": {
          maxWidth: "100%",
        },
        "& > * + *": {
          mt: 1,
        },
      }}
    >
      <Box
        sx={{
          flex: "1 1 0%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          "& > *": {
            maxWidth: "100%",
          },
        }}
        ref={msgRef}
      >
        {messages.map((msg): React.ReactElement => {
          let showDate = false;
          let showTime = !!chatCtl.getOption().showDateTime;
          if (chatCtl.getOption().showDateTime) {
            const current = dayjs(
              msg.createdAt
            );

            if (current.format("YYYYMMDD") !== prevDate.format("YYYYMMDD")) {
              showDate = true;
            }
            prevDate = current;

            if (current.diff(prevTime) < 60_000) {
              showTime = false;
            } else {
              prevTime = current;
            }
          }
          if (msg.type === "text" || msg.type === "jsx") {
            return (
              <MuiMessage
                key={messages.indexOf(msg)}
                id={`cu-msg-${messages.indexOf(msg) + 1}`}
                message={msg}
                showDate={showDate}
                showTime={showTime}
              />
            );
          }
          return (
            <MuiMessage
              key={messages.indexOf(msg)}
              id={`cu-msg-${messages.indexOf(msg) + 1}`}
              message={unknownMsg}
              showDate={showDate}
              showTime={showTime}
            />
          );
        })}
      </Box>
      <Box
        sx={{
          flex: "0 1 auto",
          display: "flex",
          alignContent: "flex-end",
          "& > *": {
            minWidth: 0,
          },
        }}
      >
        {actReq && actReq.type === "text" && (
          <MuiTextInput
            chatController={chatCtl}
            actionRequest={actReq as TextActionRequest}
            inputProps={textInputProps}
            buttonProps={submitButtonProps}
          />
        )}

      </Box>
    </Box>
  );
}
