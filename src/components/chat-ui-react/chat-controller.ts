import type {
  ActionRequest,
  ActionResponse,
  ChatOption,
  Message,
  MessageContent,
  OnActionChanged,
  OnActionResponse,
  OnMessagesChanged,
} from './chat-types';

interface ChatState {
  option: ChatOption;
  messages: Message<MessageContent>[];
  action: Action;
  onMessagesChanged: OnMessagesChanged[];
  onActionChanged: OnActionChanged[];
}

interface Action {
  request: ActionRequest;
  hasResponded: boolean;
  responseHandlers: OnActionResponse[];
}

export class ChatController {
  private state: ChatState;

  private defaultOption: ChatOption = {
    delay: 300,
  };

  private emptyAction: Action = {
    request: { type: 'empty' },
    hasResponded: false,
    responseHandlers: [],
  };

  private defaultActionRequest = {
    always: false,
    addMessage: true,
  };

  constructor(option?: ChatOption) {
    this.state = {
      option: { ...this.defaultOption, ...option },
      messages: [],
      action: this.emptyAction,
      onMessagesChanged: [],
      onActionChanged: [],
    };
  }

  addMessage(message: Message<MessageContent>): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const len = this.state.messages.push(message);
        const idx = len - 1;
        this.state.messages[idx].createdAt = new Date();
        this.callOnMessagesChanged();

        resolve(idx);
      }, this.state.option.delay);
    });
  }

  getMessages(): Message<MessageContent>[] {
    return this.state.messages;
  }

  setMessages(messages: Message<MessageContent>[]): void {
    this.clearMessages();
    this.state.messages = [...messages];
    this.callOnMessagesChanged();
  }

  clearMessages(): void {
    this.state.messages = [];
    this.callOnMessagesChanged();
  }

  private callOnMessagesChanged(): void {
    this.state.onMessagesChanged.map((h) => h(this.state.messages));
  }

  addOnMessagesChanged(callback: OnMessagesChanged): void {
    this.state.onMessagesChanged.push(callback);
  }

  removeOnMessagesChanged(callback: OnMessagesChanged): void {
    const idx = this.state.onMessagesChanged.indexOf(callback);
    if (idx !== -1) this.state.onMessagesChanged.splice(idx, 1);
  }

  setActionRequest<T extends ActionRequest>(
    request: T,
    onResponse?: OnActionResponse,
  ): Promise<ActionResponse> {
    const action: Action = {
      request: { ...this.defaultActionRequest, ...request },
      hasResponded: false,
      responseHandlers: [],
    };

    // See setActionResponse method
    return new Promise((resolve, reject) => {
      if (!request.always) {
        const returnResponse = (response: ActionResponse): void => {
          if (!response.error) {
            resolve(response);
          } else {
            reject(response.error);
          }
        };
        action.responseHandlers.push(returnResponse);
      }

      if (onResponse) {
        action.responseHandlers.push(onResponse);
      }

      this.state.action = action;
      this.callOnActionChanged(action.request);

      if (request.always) {
        resolve({ type: 'text', value: 'dummy' });
      }
    });
  }

  cancelActionRequest(): void {
    this.state.action = this.emptyAction;
    this.callOnActionChanged(this.emptyAction.request);
  }

  getActionRequest(): ActionRequest | undefined {
    const { request, hasResponded } = this.state.action;
    if (!request.always && hasResponded) {
      return undefined;
    }

    return request;
  }

  async setActionResponse(
    request: ActionRequest,
    response: ActionResponse,
  ): Promise<void> {
    const { request: origReq, responseHandlers } = this.state.action;
    if (request !== origReq) {
      throw new Error('Invalid action.');
    }
    if (!request.always && responseHandlers.length === 0) {
      throw new Error('Response handlers are not set.');
    }

    this.state.action.hasResponded = true;
    this.callOnActionChanged(request, response);

    if (request.addMessage) {
      await this.addMessage({
        type: 'text',
        content: response.value,
        self: true,
      });
    }

    responseHandlers.map((h) => h(response));
  }

  private callOnActionChanged(
    request: ActionRequest,
    response?: ActionResponse,
  ): void {
    this.state.onActionChanged.map((h) => h(request, response));
  }

  addOnActionChanged(callback: OnActionChanged): void {
    this.state.onActionChanged.push(callback);
  }

  removeOnActionChanged(callback: OnActionChanged): void {
    const idx = this.state.onActionChanged.indexOf(callback);
    if (idx !== -1) this.state.onActionChanged.splice(idx, 1);
  }

  getOption(): ChatOption {
    return this.state.option;
  }
}
