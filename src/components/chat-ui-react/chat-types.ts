export interface ChatOption {
  delay?: number;
  showDateTime?: boolean;
}

export interface Message<C extends MessageContent> {
  type: string;
  content: C;
  self: boolean;
  username?: string;
  avatar?: string;
  createdAt?: Date;
}

export type MessageContent = string | React.JSX.Element;

export interface ActionRequest {
  type: string;
  always?: boolean;
  addMessage?: boolean;
}

export interface TextActionRequest extends ActionRequest {
  type: 'text';
  defaultValue?: string;
  placeholder?: string;
  sendButtonText?: string;
}

export interface ActionResponse {
  type: string;
  value: string;
  error?: Error;
}

export interface TextActionResponse extends ActionResponse {
  type: 'text';
}

export interface OnMessagesChanged {
  (messages: Message<MessageContent>[]): void;
}

export interface OnActionChanged {
  (request: ActionRequest, response?: ActionResponse): void;
}

export interface OnActionResponse {
  (response: ActionResponse): void;
}
