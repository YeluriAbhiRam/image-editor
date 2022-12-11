import { assign } from '@xstate/immer'
import { createMachine, sendParent } from 'xstate'

const machine = createMachine(
  {
    id: 'loadImage',
    initial: 'idle',
    states: {
      idle: {
        on: {
          LOAD_IMAGE: {
            actions: ['setUrlToLoad'],
            target: 'loadingImage'
          }
        }
      },
      loadingImage: {
        invoke: {
          id: 'loadImageService',
          src: (ctx, event) => {
            const editorInstance = event.editorRef?.current?.getInstance()
            return editorInstance.loadImageFromURL(ctx.urlToLoad, 'pending').then((res) => {
              editorInstance.clearUndoStack()
              return res
            })
          },
          onDone: {
            actions: [sendParent({ type: 'IMAGE_LOADED' })],
            target: 'idle'
          },
          onError: {
            actions: [sendParent({ type: 'IMAGE_LOADED' })],
            target: 'idle' // TODO: change it
          }
        }
      }
      //   loadingImageSuccess: {},
      //   retryLoading: {}
    }
  },
  {
    actions: {
      setUrlToLoad: assign((ctx, event) => {
        ctx.urlToLoad = event.url
      })
    }
  }
)

export default machine
