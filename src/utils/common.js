/* eslint-disable no-unused-expressions */
/* eslint-disable valid-typeof */
/* eslint-disable no-empty */
import { uniq } from "ramda";

const EDITOR_OPERATIONS_MAPPER = {
  addShape: "blur",
  addObject: "smudge",
  loadImage: "crop",
  rotate: "rotate",
  brightness: "brightness",
  contrast: "contrast",
};

export const imageModify = {
  crop: "DWICR",
  smudge: "DWISM",
  rotate: "DWIRO",
  upload: "DWIUP",
  blur: "DWIBR",
  brightness: "DWIBT",
  contrast: "DWICT",
};

export const getRelativeImageEditPositions = (
  editPositions,
  currentImageResolution,
  editedImageResolution
) => {
  if (
    currentImageResolution?.width !== editedImageResolution?.width ||
    currentImageResolution?.height !== editedImageResolution?.height
  )
    return editPositions?.map((pos) => ({
      ...pos,
      width:
        pos.width *
        (currentImageResolution.width / editedImageResolution.width),
      height:
        pos.height *
        (currentImageResolution.height / editedImageResolution.height),
      left:
        pos.left * (currentImageResolution.width / editedImageResolution.width),
      top:
        pos.top *
        (currentImageResolution.height / editedImageResolution.height),
    }));

  return editPositions;
};

export const getEditorOptions = (editorStack) => {
  const editorOperationsStack = editorStack
    .map((stack) => {
      if (stack.name === "applyFilter") {
        return EDITOR_OPERATIONS_MAPPER[stack.args[1]];
      } else {
        return EDITOR_OPERATIONS_MAPPER[stack.name];
      }
    })
    .filter((stack, index) => stack);

  let removedObjectsStack = editorStack
    .filter((stack) => stack.name === "removeObject")
    .map((stack) => stack.args[2]);

  const filteredEditorOperationsStack = uniq(
    editorOperationsStack.filter((stack) => {
      const shapeRemovedIndex = removedObjectsStack.findIndex(
        (stack) => stack === "Shape"
      );
      const drawRemovedIndex = removedObjectsStack.findIndex(
        (stack) => stack === "Draw"
      );

      if (stack === "blur" && shapeRemovedIndex !== -1) {
        removedObjectsStack = removedObjectsStack.filter(
          (_, index) => index !== shapeRemovedIndex
        );
        return false;
      } else if (stack === "smudge" && drawRemovedIndex !== -1) {
        removedObjectsStack = removedObjectsStack.filter(
          (_, index) => index !== drawRemovedIndex
        );
        return false;
      }
      return true;
    })
  );
  return filteredEditorOperationsStack;
};

export const loadImage = (imgUrl) => {
  const image = new Image();
  image.src = imgUrl;
};
export const imageContext = {
  images : ["https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg"]
};

