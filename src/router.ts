// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/attendance`
  | `/attendance/download`
  | `/attendance/info`
  | `/auth`
  | `/auth/login`
  | `/auth/register`
  | `/bbs`
  | `/bbs/:board/:postId/edit`
  | `/bbs/:board/:postId/view`
  | `/bbs/:board/create`
  | `/bbs/:board/list`
  | `/chat`
  | `/chat/idbot`
  | `/construct`
  | `/contributors`
  | `/dev`
  | `/dev/user`
  | `/setting`
  | `/setting/account`
  | `/specialroom`
  | `/specialroom/apply`
  | `/specialroom/management`
  | `/specialroom/status`

export type Params = {
  '/bbs/:board/:postId/edit': { board: string; postId: string }
  '/bbs/:board/:postId/view': { board: string; postId: string }
  '/bbs/:board/create': { board: string }
  '/bbs/:board/list': { board: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
