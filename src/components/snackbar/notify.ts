import {
  enqueueSnackbar,
  type OptionsObject,
  type VariantType,
} from "notistack";

export function notify(
  message: string,
  variant: VariantType = "info",
  options?: Pick<OptionsObject, "action">,
) {
  enqueueSnackbar(message, { variant, preventDuplicate: true, ...options });
}
