import { PageSurface } from "@/components/layout/page-surface";

import { Permission } from "@/features/auth/token";
import type * as apiTypes from "@/api/types";
import { Box, Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import { TitleText } from "@/components/basics";

type UserBoxProps = {
  user: apiTypes.UserInfo;
  setUsers: Dispatch<SetStateAction<apiTypes.UserInfo[]>>;
};

function UserBox(props: UserBoxProps) {
  const { user, setUsers } = props;
  return (
    <Grid size={3}>
      <FormControlLabel
        label={user.name}
        control={
          <Checkbox
            color="secondary"
            onChange={(event) => {
              if (event.target.checked) {
                startLoading("처리 중입니다...");
                api
                  .deleteAccount({
                    name: user.name,
                  })
                  .then((result) => {
                    stopLoading();
                    api
                      .getSpecialroomStudentInfo()
                      .then((result) => {
                        setUsers(result.studentInfo);
                      })
                      .catch(() => {
                        /* Api already displayed the error. */
                      });
                  })
                  .catch(() => {
                    /* Api already displayed the error. */
                  });
              }
            }}
          />
        }
      />
    </Grid>
  );
}

export default function UserManagementScreen() {
  const [users, setUsers] = useState<apiTypes.UserInfo[]>([]);

  useEffect(() => {
    api
      .getSpecialroomStudentInfo()
      .then((result) => {
        setUsers(result.studentInfo);
      })
      .catch(() => {
        /* Api already displayed the error. */
      });
  }, []);

  return (
    <>
      <PageSurface maxWidth="md">
        <Box component="form" sx={{ padding: "50px 30px 30px 30px" }}>
          <TitleText>유저 관리</TitleText>
          <Box sx={{ padding: "30px 30px 30px" }}>
            <TextField label="이름" name="name" />
            <Grid container spacing={2}>
              {users.map((user) => {
                return <UserBox key={user.name} user={user} setUsers={setUsers} />;
              })}
            </Grid>
          </Box>
        </Box>
      </PageSurface>
    </>
  );
}

export const handle = { permission: Permission.Dev };
