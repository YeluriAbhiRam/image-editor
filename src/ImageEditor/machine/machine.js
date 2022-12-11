import { createMachine, send } from 'xstate'

const saveEditedImageEvent = {
  SAVE_EDITED_IMAGE: [
    {
      actions: ['resetZoom', 'saveEditedImage'],
    }
  ]
}

const editorMachine = {
  id: 'imageEditor',
  type: 'parallel',
  states: {
    main: {
      on: {
        PIXELATE: {
          target: '.pixelate'
        },
        BRUSH: {
          target: '.brush'
        },
        ROTATE_CLOCK_WISE: {
          actions: ['rotateClockWise'],
          target: '.idle'
        },
        ROTATE_ANTI_CLOCK_WISE: {
          actions: ['rotateAntiClockWise'],
          target: '.idle'
        },
        CROP: {
          actions: ['startCropMode'],
          target: '.crop'
        },
        UNDO: {
          actions: ['undoChanges']
        },
        REDO: {
          actions: ['redoChanges']
        },
        CANCEL: {},
        SET_POINTER_POSITION: {
          actions: ['setPointerPosition']
        },
        TOGGLE_ORIGINAL: {
          actions: ['setShowOriginal'],
          target: '.loadingImage'
        },
        BRIGHTNESS: {
          target: '.setBrightness'
        },
        BACK: {
          actions: ['resetShowOriginal', 'resetHighlightChanges', 'resetZoom', send({ type: 'LOAD_IMAGE' })],
        }
      },
      initial: 'idle',
      states: {
        loadingImage: {
          entry: ['loadImage'],
          on: {
            IMAGE_LOADED: {
              actions: ['setCustomOpacityTo1', 'showHighlights'],
              target: 'idle'
            }
          }
        },
        idle: {
          entry: ['stopDrawing', 'endZoomIn', 'resetZoom'],
          on: {
            ...saveEditedImageEvent
          }
        },
        pixelate: {
          entry: ['endZoomIn'],
          on: {
            PIXELATE: {
              target: 'idle'
            },
            SET_BLUR: {
              actions: ['setBlurValue', 'handleBlurChange']
            },
            SET_PIXELATE_VALUE: {
              actions: ['setPixelateValue', 'handlePixelateChange']
            },
            ADD_RECTANGLE: {
              actions: ['addRectangle']
            },
            ADD_CIRCLE: {
              actions: ['addCircle']
            },
            OBJECT_ACTIVATED: {
              actions: ['setActiveObject']
            },
            ...saveEditedImageEvent
          }
        },
        brush: {
          exit: 'stopDrawing',
          initial: 'freeDrawing',
          entry: [send('FREE'), 'endZoomIn'],
          on: {
            BRUSH: {
              target: 'idle'
            },
            SET_BRUSH_SIZE: {
              actions: ['stopDrawing', 'setBrushSize']
            },
            SET_COLOR: {
              actions: ['setColor', 'stopDrawing']
            },
            FREE: {
              actions: ['startFreeDrawingMode'],
              target: '.freeDrawing'
            },
            LINE: {
              actions: ['startLineDrawingMode'],
              target: '.lineDrawing'
            },
            ...saveEditedImageEvent
          },
          states: {
            idle: {},
            freeDrawing: {
              on: {
                SET_BRUSH_SIZE: {
                  actions: ['stopDrawing', 'setBrushSize', 'startFreeDrawingMode']
                },
                SET_COLOR: {
                  actions: ['setColor', 'stopDrawing', 'startFreeDrawingMode']
                }
              }
            },
            lineDrawing: {
              on: {
                SET_BRUSH_SIZE: {
                  actions: ['stopDrawing', 'setBrushSize', 'startLineDrawingMode']
                },
                SET_COLOR: {
                  actions: ['setColor', 'stopDrawing', 'startLineDrawingMode']
                }
              }
            }
          }
        },
        crop: {
          entry: ['endZoomIn'],
          exit: ['stopDrawing'],
          on: {
            CROP: {
              target: 'idle'
            },
            APPLY_CROP: {
              actions: ['cropImage', send('CROP')]
            },
            RESET_CROP: {
              target: 'idle'
            }
          }
        },
        rejectAndReEditedSuccess: {
          initial: 'idle',
          on: {
            CONTINUE: [
              {
                cond: 'hasReachedLastImage',
                actions: ['']
              },
              {
                actions: [
                  'incrementCounter',
                  'setCurrentSequence',
                  'notifyUploadImageSuccess',
                  'resetShowOriginal',
                  'resetHighlightChanges',
                  'setIssueSequencesAndCounter'
                ],
                target: '.loadingImage'
              }
            ]
          },
          states: {
            idle: {},
            loadingImage: {
              entry: ['loadImage'],
              on: {
                IMAGE_LOADED: {
                  actions: ['setCustomOpacityTo1', 'showHighlights'],
                  target: '#editor.editingImage'
                }
              }
            }
          }
        },
        setBrightness: {
          entry: ['endZoomIn'],
          on: {
            BRIGHTNESS: {
              target: 'idle'
            },
            SET_BRIGHTNESS: {
              actions: ['setBrightnessValue', 'handleBrightnessChange']
            },
            SET_CONTRAST: {
              actions: ['setContrastValue', 'handleContrastChange']
            },
            RESET_BRIGHTNESS: {
              actions: ['resetBrightness']
            },
            ...saveEditedImageEvent
          }
        },
        uploadEditedImageService: {
          tags: ['loading'],
          invoke: {
            id: 'uploadEditedImageService',
            src: 'uploadEditedImageService',
            onDone: [
              {
                actions: [
                  'setEditedImageId',
                  'setPendingImageEditedEventNotes',
                  'changeStatusOfOldEditIssueAndCreateNewIssue'
                ]
              }
            ],
            onError: {
              actions: ['notifyEditedImageFailure', 'closeDialog']
            }
          }
        },
      }
    },
    background: {
      initial: 'zoom',
      on: {},
      states: {
        idle: {},
        zoom: {
          exit: ['endZoomIn'],
          on: {
            ZOOM: {
              actions: ['startZoomIn']
            },
            HAND_MODE: {
              actions: ['startHand']
            },
            STOP_HAND_MODE: {
              actions: ['endHand', 'startZoomIn']
            },
            RESET_ZOOM: {
              actions: ['resetZoom']
            },
            ZOOM_OUT: {
              actions: ['zoomOut']
            }
          }
        }
      }
    }
  }
}

const machine = createMachine({
  id: 'editor',
  initial: 'loading',
  states: {
    loading: {
      on: {
        IMAGE_LOADED: {
          actions: ['setLoaded', 'clearUndoStack'],
          target: 'editingImage'
        }
      }
    },
    error: {},
    editingImage: {
      // same as image editor machine
      ...editorMachine
    }
  }
})

export default machine
