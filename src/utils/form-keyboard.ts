export function isCompositionEnter(event: { key: string; isComposing: boolean; keyCode: number }) {
  return event.key === "Enter" && (event.isComposing || event.keyCode === 229);
}
export function isChatSubmit(event: { key: string; shiftKey: boolean; isComposing: boolean; keyCode: number }) {
  return event.key === "Enter" && !event.shiftKey && !isCompositionEnter(event);
}
