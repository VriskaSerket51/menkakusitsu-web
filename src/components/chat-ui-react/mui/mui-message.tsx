import { Avatar, Box, Grow, Typography } from '@mui/material';
import React from 'react';

import { Message, MessageContent } from '../chat-types';

export function MuiMessage({
  id,
  message,
  showDate,
  showTime,
}: {
  id: string;
  message: Message<MessageContent>;
  showDate: boolean;
  showTime: boolean;
}): React.ReactElement {
  if (message.deletedAt) {
    return <div id={id} />;
  }

  const dispDate = message.updatedAt ? message.updatedAt : message.createdAt;

  const chatAvatar = (
    <Box
      sx={{
        minWidth: 0,
        flexShrink: 0,
        ml: message.self ? 1 : 0,
        mr: message.self ? 0 : 1
      }}>
      <Avatar alt={message.username} src={message.avatar} />
    </Box>
  );

  const chatUsername = (
    <Box
      sx={{
        maxWidth: "100%",
        mx: 1
      }}>
      <Typography variant="body2" align={message.self ? 'right' : 'left'}>
        {message.username}
      </Typography>
    </Box>
  );

  const chatDate = (
    <Box
      sx={{
        maxWidth: "100%",
        mx: 1
      }}>
      <Typography
        variant="body2"
        align={message.self ? 'right' : 'left'}
        color="textSecondary"
      >
        {dispDate?.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Typography>
    </Box>
  );

  return (
    <Grow in>
      <Box
        sx={{
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column"
        }}>
        {showDate && (
          <Typography align="center">
            {dispDate?.toLocaleDateString()}
          </Typography>
        )}
        <Box
          id={id}
          style={{ overflowWrap: 'break-word' }}
          sx={{
            maxWidth: "100%",
            my: 1,
            pl: message.self ? '20%' : 0,
            pr: message.self ? 0 : '20%',
            display: "flex",
            justifyContent: message.self ? 'flex-end' : 'flex-start'
          }}>
          {message.avatar && !message.self && chatAvatar}
          <Box
            sx={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column"
            }}>
            {message.username && chatUsername}
            <Box
              sx={{
                maxWidth: "100%",
                py: 1,
                px: 2,
                bgcolor: message.self ? 'info.light' : 'background.paper',
                color: message.self ? 'info.contrastText' : 'text.primary',
                borderRadius: 4,
                boxShadow: 2
              }}>
              {message.type === 'text' && (
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              )}
              {message.type === 'jsx' && <div>{message.content}</div>}
            </Box>
            {showTime && chatDate}
          </Box>
          {message.avatar && message.self && chatAvatar}
        </Box>
      </Box>
    </Grow>
  );
}
