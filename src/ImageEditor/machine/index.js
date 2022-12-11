/* eslint-disable import/no-anonymous-default-export */
import machine from "./machine";
import actions from "./actions";
import * as guards from "./guards";
import * as services from "./services";

export default (editorRef, additionalActions={}) =>
  machine.withConfig({
    actions: {
      ...actions(
        editorRef,
      ),
      ...additionalActions,
    },
    guards,
    services,
  });
