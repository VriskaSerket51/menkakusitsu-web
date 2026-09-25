import type * as apiTypes from "@/api/types";
import {
  Alert,
  Button,
  Box,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode, useState, useEffect } from "react";
import dayjs from "dayjs";

import * as api from "@/api/actions";
import { Text } from "@/components/basics";

type MealType = {
  breakfast: apiTypes.MealInfo;
  lunch: apiTypes.MealInfo;
  dinner: apiTypes.MealInfo;
};

export default function MealInfo() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const [meal, setMeal] = useState<MealType>({
    breakfast: { meals: [] },
    lunch: { meals: [] },
    dinner: { meals: [] },
  });

  useEffect(() => {
    const controller = new AbortController();
    api
      .getMeal({ signal: controller.signal, silent: true })
      .then((response) => {
        if (controller.signal.aborted) return;
        setMeal({
          breakfast: {
            meals: response.breakfast.meals.filter((meal) => Boolean(meal)),
          },
          lunch: {
            meals: response.lunch.meals.filter((meal) => Boolean(meal)),
          },
          dinner: {
            meals: response.dinner.meals.filter((meal) => Boolean(meal)),
          },
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  if (status === "error")
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            onClick={() => {
              setStatus("loading");
              setAttempt((value) => value + 1);
            }}
          >
            다시 시도
          </Button>
        }
      >
        급식 정보를 불러오지 못했습니다.
      </Alert>
    );
  if (status === "loading")
    return (
      <Skeleton
        variant="rounded"
        height={160}
        aria-label="급식 정보를 불러오는 중입니다"
      />
    );

  const hour = dayjs().hour();

  return (
    <Paper>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-evenly",
        }}
      >
        <MealView title="점심" meals={meal.lunch.meals} highlight={hour < 13} />
        <MealView
          title="저녁"
          meals={meal.dinner.meals}
          highlight={hour >= 13 && hour < 19}
        />
        <MealView
          title="아침"
          meals={meal.breakfast.meals}
          highlight={hour >= 19}
        />
      </Stack>
    </Paper>
  );
}

type MealViewProps = {
  title: string;
  meals: string[];
  highlight?: boolean;
};

function MealView(props: MealViewProps) {
  const { title, meals, highlight } = props;

  return (
    <Box
      sx={{
        flex: 1,
      }}
    >
      {highlight && (
        <Box
          sx={{
            borderRadius: "1px",
            borderStyle: "solid none none none",
            borderColor: "primary.main",
            borderWidth: "8px",
          }}
        />
      )}
      <Box
        sx={{
          padding: "32px",
        }}
      >
        <Typography variant="h5">{title}</Typography>
        {meals.length > 0 ? (
          meals.map((meal) => {
            return (
              <Text key={meal} variant="h6">
                <div dangerouslySetInnerHTML={{ __html: `- ${meal}` }} />
              </Text>
            );
          })
        ) : (
          <Text variant="h6">즐거운 집밥!</Text>
        )}
      </Box>
    </Box>
  );
}

type MealProps = {
  isHighlighted?: boolean;
  children: ReactNode;
};

function Meal(props: MealProps) {
  const { isHighlighted, children } = props;

  if (isHighlighted) {
    return (
      <Box
        sx={{
          display: "block",
          padding: "34px 30px 30px 30px",
          borderRadius: "1px",
          borderStyle: "solid none none none",
          borderColor: "primary.main",
          borderWidth: "8px",
          flex: 1,
        }}
      >
        {children}
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          display: "block",
          padding: "50px 30px 30px 30px",
          flex: 1,
        }}
      >
        {children}
      </Box>
    );
  }
}
