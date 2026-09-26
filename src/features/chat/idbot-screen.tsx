import { Link } from "react-router";
import { ArrowBack } from "@mui/icons-material";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import { useState, useEffect } from "react";

import { ChatController, MuiChat } from "@/components/chat-ui-react";
import * as api from "@/api/actions";
import { setFooterActive, setHeaderActive } from "@/hooks/use-navbar";
import { useColorScheme } from "@/hooks/use-color-scheme";

const BOT_NAME = "이디봇";

export default function IdbotScreen() {
  const { scheme } = useColorScheme();
  const [chatCtl] = useState(() =>
    new ChatController({
      showDateTime: true,
    })
  );

  useEffect(() => {
    setHeaderActive(false);
    setFooterActive(false);
    return () => {
      setHeaderActive(true);
      setFooterActive(true);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const addBotMessage = async (content: string) => {
      await chatCtl.addMessage({
        type: "jsx",
        content: <div dangerouslySetInnerHTML={{ __html: content }}></div>,
        self: false,
        avatar: "/logo.png",
        username: BOT_NAME,
      });
    };
    const welcome: string[] = [];
    welcome.push(`${BOT_NAME} v1.0.2 Made by COMMON<br />
        Contributors: 23기 이현석, 23기 고승한, 23기 박도현, 23기 선우준, 23기 이찬솔`);

    welcome.push(`안녕하세요! ${BOT_NAME}이에요. 저는 다음과 같은 기능을 할 수 있어요. 다음 예시문장으로 제 기능을 테스트 해 보세요!<br />
        - 과목별 교사 확인: 물리학 과목 선생님은 누가 있어?<br />
        - 급식표: 오늘 급식 알려줘<br />
        - 학사일정: 학사일정 알려줘<br />
        - 생활지도 교사 확인: 생활지도쌤 누구야?<br />
        - 상수표: 상수표 보여줘<br />
        - 그 외: 조졸조진 어떻게 해?/점심시간은 몇시야?/특별실 어떻게 써?/학활실 이디저디에서 써도 돼?`);
    chatCtl.setMessages(welcome.map(content => ({
      type: "jsx", content: <div dangerouslySetInnerHTML={{ __html: content }} />,
      self: false, avatar: "/logo.png", username: BOT_NAME, createdAt: new Date(),
    })));
    void chatCtl.setActionRequest(
      {
        type: "text",
        always: true,
        addMessage: false,
        placeholder: "메시지를 입력해 주세요.",
      },
      (response) => {
        chatCtl.addMessage({
          type: "text",
          content: response.value,
          self: true,
          avatar: "https://cdn-icons-png.flaticon.com/512/1177/1177594.png",
          username: "나",
        });
        api.getIdbotChat({ chatInput: response.value }, { signal: controller.signal }).then((result) => {
          if (!controller.signal.aborted) void addBotMessage(result.chatOutput);
        }).catch(() => { /* Api already displayed the error. */ });
      }
    );
    return () => { controller.abort(); chatCtl.cancelActionRequest(); };
  }, [chatCtl]);

  return (
    <>
      <Box
        sx={{
          height: "100dvh",
          backgroundImage:
            scheme == "light"
              ? "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
              : "linear-gradient(135deg, #22242b 0%, #18181e 100%)",
        }}
      >
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            maxWidth: "640px",
            marginLeft: "auto",
            marginRight: "auto",
            bgcolor: "background.default",
          }}
          elevation={3}
        >
          <Box sx={{ display: "flex", alignItems: "center", p: 1, gap: 1 }}>
          <IconButton component={Link} to="/" aria-label="홈으로 돌아가기"><ArrowBack /></IconButton>
          <Typography sx={{ flex: 1, textAlign: "center", pr: 6 }}>
            {BOT_NAME}과 소통해요 :D
          </Typography>
          </Box>
          <Divider />
          <Box sx={{ flex: "1 1 0%", minHeight: 0 }}>
            <MuiChat
              chatController={chatCtl}
              textInputProps={{ color: "primary" }}
              submitButtonProps={{ color: "primary", variant: "contained" }}
            />
          </Box>
        </Paper>
      </Box>
    </>
  );
}
