/* eslint-disable import/no-anonymous-default-export */
import { assign } from "@xstate/immer";
import {
  getEditorOptions,
  getRelativeImageEditPositions,
} from "../../utils/common";

import { spawn, assign as xAssign, send } from "xstate";
import loadImagesService from "./loadImageService";

export const setCustomCssProperty = (propertyName, propertyValue) =>
  document.querySelector(':root').style.setProperty(propertyName, propertyValue)


export default (editorRef) => ({
  setCustomOpacityTo1: assign(() => {
    setCustomCssProperty("--custom-opacity", 1);
  }),
  incrementCounter: assign((ctx) => {
    if (ctx.counter < ctx.sequences?.length - 1) {
      ctx.counter = ctx.counter + 1;
    }
  }),

  setCurrentSequence: assign((ctx) => {
    ctx.currentSequence = ctx.sequences[ctx.counter];

    ctx.currentFile = ctx.images?.find(
      (img) => img.sequence === ctx.currentSequence
    );

    ctx.currentFileLink = ctx.currentFile?.link;
  }),

  loadImage: send(
    (ctx) => {
      return {
        type: "LOAD_IMAGE",
        url: !ctx.showOriginal
          ? ctx.currentFile?.pending?.link
          : ctx.currentFileLink,
        editorRef: editorRef,
      };
    },
    { to: (ctx) => ctx.loadImageRef }
  ),

  // function -> should take resolution and positions

  setHighlightChanges: assign((ctx, event) => {
    ctx.highlightChanges = event.value;
  }),
  resetHighlightChanges: assign((ctx, event) => {
    ctx.highlightChanges = !ctx?.showOriginal;
  }),
  setShowOriginal: assign((ctx, event) => {
    ctx.showOriginal = event.showOriginal;
  }),
  resetShowOriginal: assign((ctx, event) => {
    ctx.showOriginal = false;
  }),

  
  setIssueSequencesAndCounter: assign((ctx, event) => {
    ctx.sequences = ctx.issues
      ?.filter((issue) => issue?.action !== "RJCT_RE_EDIT")
      ?.map((issue) => issue?.sequence);
    ctx.counter = ctx.sequences?.findIndex(
      (seq) => seq === ctx.currentSequence
    );
  }),

  setEditedImageId: assign((ctx, event) => {
    ctx.editedImageId = event.data?.entityOwnerValidationResult?.lot_image_id;
  }),

  changeStatusOfOldEditIssueAndCreateNewIssue: assign((ctx, event) => {
    const { currentFile } = ctx;

    const newIssue = {
      // imgId: currentFile.imgId,
      sequence: currentFile.sequence,
      imgId: currentFile.id,
      fileType: currentFile.fileType,
      stepCode: ctx.stepCode,
      documentType: currentFile.documentType,
      editedImageId: ctx.editedImageId,
      editedPositions: ctx.editedPositions,
      deleteFlag: false,
      editorOperations: ctx.editorOperations,
    };

    if (ctx.approverMode) {
      ctx.issues = ctx.issues.map((issue) => {
        if (issue.sequence === ctx.currentSequence) {
          return {
            ...issue,
            action: "RJCT_RE_EDIT",
            rejectReason: "REDIT",
            deleteFlag: true,
            additionalComment: ctx.showOriginal
              ? "Edited Original image"
              : "Edited Recommended image",
            editorOperations: ctx.editorOperations,
          };
        }
        return { ...issue };
      });
    } else {
      if (
        ctx.issues?.find((issue) => issue?.sequence === ctx.currentSequence)
      ) {
        ctx.issues = ctx.issues.map((issue) => {
          if (issue.sequence === ctx.currentSequence) {
            return { ...issue, ...newIssue };
          }
          return { ...issue };
        });
      } else {
        ctx.issues.push({ ...newIssue });
      }
    }
  }),

  saveEditedImage: assign((ctx) => {
    const editorInstance = editorRef.current.getInstance();
    ctx.dataURL = editorInstance.toDataURL({ format: 'jpeg' });
    console.log('editor instance',editorInstance._invoker._undoStack);
  }),

  clearUndoStack: () => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance?.clearUndoStack();
  },
  setLoaded: assign((ctx) => {
    ctx.loaded = true;
  }),
  spawnLoadImageService: xAssign({
    loadImageRef: (context) =>
      spawn(loadImagesService.withContext({}), "loadImagesService"),
  }),

  addRectangle: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.addShape("rect", {
      fill: {
        type: "filter",
        filter: [{ blur: ctx.blur }, { pixelate: ctx.pixelate }],
      },
      strokeWidth: 0,
      left: ctx.pointer?.x,
      top: ctx.pointer?.y,
      width: 100,
      height: 200,
      isRegular: false,
    });
  },

  addCircle: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.addShape("circle", {
      fill: {
        type: "filter",
        filter: [{ blur: ctx.blur }, { pixelate: ctx.pixelate }],
      },
      strokeWidth: 0,
      left: ctx.pointer?.x,
      top: ctx.pointer?.y,
      rx: 50,
      ry: 50,
      isRegular: false,
    });
  },

  setPixelateValue: assign((ctx, event) => {
    ctx.pixelate = Number(event.value);
  }),

  setBlurValue: assign((ctx, event) => {
    ctx.blur = Number(event.value);
  }),

  setBrightnessValue: assign((ctx, event) => {
    ctx.brightness = Number(event.value);
  }),

  setContrastValue: assign((ctx, event) => {
    ctx.contrast = Number(event.value);
  }),

  startCropMode: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.startDrawingMode("CROPPER");
  },

  cropImage: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.crop(editorInstance.getCropzoneRect()).then(function () {
      editorInstance.stopDrawingMode();
    });
  },

  rotateClockWise: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.rotate(90);
  },

  rotateAntiClockWise: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.rotate(-90);
  },

  undoChanges: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.undo();
  },

  redoChanges: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.redo();
  },

  startFreeDrawingMode: (ctx) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.startDrawingMode("FREE_DRAWING", {
      width: ctx.brushSize,
      color: ctx.color,
    });
  },
  startLineDrawingMode: (ctx) => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance.startDrawingMode("LINE_DRAWING", {
      width: ctx.brushSize,
      color: ctx.color,
    });
  },
  setActiveObject: assign((ctx, event) => {
    ctx.activeObjectId = Number(event.id);
  }),

  handlePixelateChange: (ctx, event) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.changeShape(ctx.activeObjectId, {
      fill: {
        type: "filter",
        filter: [{ blur: ctx.blur }, { pixelate: Number(event.value) }],
      },
    });
  },
  handleBlurChange: (ctx, event) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.changeShape(ctx.activeObjectId, {
      fill: {
        type: "filter",
        filter: [{ blur: Number(event.value) }, { pixelate: ctx.pixelate }],
      },
    });
  },
  handleBrightnessChange: (ctx, event) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance
      .applyFilter("brightness", {
        brightness: parseInt(Number(event.value), 10) / 255,
      })
      .then(function (result) {
        console.log(result);
      });
  },
  handleContrastChange: (ctx, event) => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance
      .applyFilter("contrast", {
        contrast: parseInt(Number(event.value), 10) / 255,
      })
      .then(function (result) {
        console.log(result);
      });
  },

  resetBrightness: (ctx) => {
    const editorInstance = editorRef.current.getInstance();
    ctx.brightness = 0;
    ctx.contrast = 0;
    editorInstance
      .applyFilter("brightness", { brightness: 0 })
      .then((result) => {
        editorInstance
          .applyFilter("contrast", { contrast: 0 })
          .then((result) => {});
      });
  },

  stopDrawing: (ctx) => {
    const editorInstance = editorRef?.current?.getInstance();
    editorInstance && editorInstance.stopDrawingMode();
  },
  setBrushSize: assign((ctx, event) => {
    ctx.brushSize = Number(event.value);
  }),
  setColor: assign((ctx, event) => {
    ctx.color = event.value;
  }),
  resetZoom: assign((ctx) => {
    console.log("entered resetZoom");
    const editorInstance = editorRef?.current?.getInstance();
    editorInstance && editorInstance._graphics.resetZoom();
  }),
  endZoomIn: (ctx) => {
    const editorInstance = editorRef?.current?.getInstance();
    editorInstance && editorInstance._graphics.endZoomInMode();
  },
  startZoomIn: (ctx) => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance._graphics.startZoomInMode();
  },
  startHand: (ctx) => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance._graphics.startHandMode();
  },
  endHand: (ctx) => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance._graphics.endHandMode();
  },
  setPointerPosition: assign((ctx, event) => {
    ctx.pointer = event.pointer;
  }),
  zoomOut: (ctx) => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance._graphics.zoomOut();
  },
});
