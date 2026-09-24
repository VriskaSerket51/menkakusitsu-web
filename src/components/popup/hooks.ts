import { create } from "zustand";
import type { ReactNode } from "react";

type Dialog = {
  id: number;
  isOpened: boolean;
  title: ReactNode;
  content: ReactNode;
  onYes?: VoidFunction;
  onNo?: VoidFunction;
  onCancel?: VoidFunction;
};

type DialogState = {
  dialogs: Dialog[];
};

export const useDialogContainerStore = create<DialogState>(() => ({
  dialogs: [],
}));

let nextDialogId = 0;

export const openDialog = (
  title: ReactNode, content: ReactNode,
  onYes?: VoidFunction, onNo?: VoidFunction, onCancel?: VoidFunction,
) => {
  const id = ++nextDialogId;
  useDialogContainerStore.setState(state => ({
    dialogs: [...state.dialogs, { id, isOpened: true, title, content, onYes, onNo, onCancel }],
  }));
  return id;
};

export const closeDialog = (id: number) => {
  useDialogContainerStore.setState(state => {
    if (!state.dialogs.some(dialog => dialog.id === id && dialog.isOpened)) return state;
    return { dialogs: state.dialogs.map(dialog => dialog.id === id ? { ...dialog, isOpened: false } : dialog) };
  });
};

export const removeClosedDialog = (id: number) => {
  useDialogContainerStore.setState(state => {
    if (!state.dialogs.some(dialog => dialog.id === id && !dialog.isOpened)) return state;
    return { dialogs: state.dialogs.filter(dialog => dialog.id !== id) };
  });
};

export const closeAll = () => {
  useDialogContainerStore.setState(state => {
    if (!state.dialogs.some(dialog => dialog.isOpened)) return state;
    return { dialogs: state.dialogs.map(dialog => dialog.isOpened ? { ...dialog, isOpened: false } : dialog) };
  });
};

export const openConfirmDialog = (
  title: ReactNode,
  content: ReactNode,
  onYes?: VoidFunction
) => {
  return openDialog(title, content, onYes || (() => {}));
};

export const openYesNoDialog = (
  title: ReactNode,
  content: ReactNode,
  onYes?: VoidFunction,
  onNo?: VoidFunction
) => {
  return openDialog(title, content, onYes || (() => {}), onNo || (() => {}));
};

export const openCancelableDialog = (
  title: ReactNode,
  content: ReactNode,
  onCancel?: VoidFunction
) => {
  return openDialog(
    title,
    content,
    undefined,
    undefined,
    onCancel || (() => {})
  );
};

type LoadingState = {
  isLoading: boolean;
  text: string;
};

export const useLoadingStore = create<LoadingState>(() => ({
  isLoading: false,
  text: "",
}));

export const startLoading = (text: string) => {
  useLoadingStore.setState({
    isLoading: true,
    text: text,
  });
};

export const stopLoading = () => {
  useLoadingStore.setState({
    isLoading: false,
  });
};
