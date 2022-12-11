import React, { useEffect, useRef, useState } from 'react';
import {
  Icon,
  Tooltip,
  Slider,
  Button,
} from '@copart/core-components';
import { useMachine } from '@xstate/react';

import './ImageEditor.css';

import CoreImageEditor from '../image-editor';

import machine from './machine';
import Loader from '../Loader';

const ImageEditor = ({ imageUrl, onSave }) => {
  /*
    1. Initialize machine with props in ImageEditor (only url currently).
    2. Pass the machine context variables to CoreImageEditor.
  */
  const editorRef = useRef();
  const colorRef = useRef();
  const [disableUndo, setDisableUndo] = useState(true);
  const [state, send] = useMachine(
    machine(editorRef, {}).withContext({
      currentImageLink: imageUrl,
    })
  );
  const { context } = state;
  useEffect(() => {
    if (context.loaded) {
      const editorInstance = editorRef.current.getInstance();
      editorInstance.on('undoStackChanged', (length) => {
        setDisableUndo(length === 0);
      });
    }
  }, [context.loaded]);
  const handleMouseDown = () => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance.on('mousedown', (event, originPointer) => {
      send('SET_POINTER_POSITION', { pointer: originPointer })
    })
  }
  onSave(context.dataURL)
  console.log('image editor', state);
  return (
    <div className='ImageEditorDialog'>
      {state.matches('loading') && <Loader overlay />}
      {state.matches('editingImage') && (
        <section className={'ImageIconsSection'}>
          <Tooltip content='Crop'>
            <div
              onClick={() => send('CROP')}
              className={`ImageIcons ${state.matches(
                'editingImage.main.crop'
              ) && 'ActionSelected'}`}
            >
              <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
              <Icon name='crop' variant='material' />
            </div>
          </Tooltip>
          <Tooltip content='Rotate right'>
            <div
              onClick={() => send('ROTATE_CLOCK_WISE')}
              className='ImageIcons'
            >
              <Icon name='rotate_right' variant='material' />
            </div>
          </Tooltip>
          <Tooltip content='Rotate left'>
            <div
              onClick={() => send('ROTATE_ANTI_CLOCK_WISE')}
              className='ImageIcons'
            >
              <Icon name='rotate_left' variant='material' />
            </div>
          </Tooltip>
          <Tooltip content='Blur'>
            <div
              onClick={() => send('PIXELATE')}
              className={`ImageIcons ${state.matches(
                'editingImage.main.pixelate'
              ) && 'ActionSelected'}`}
            >
              <Icon name='blur_on' variant='material' />
            </div>
          </Tooltip>
          <Tooltip content='Paint Brush'>
            <div
              onClick={() => send('BRUSH')}
              className={`ImageIcons ${state.matches(
                'editingImage.main.brush'
              ) && 'ActionSelected'}`}
            >
              <Icon name='palette' variant='material' />
            </div>
          </Tooltip>
          <Tooltip content='Brightness'>
            <div
              onClick={() => send('BRIGHTNESS')}
              className={`ImageIcons ${state.matches(
                'editingImage.main.setBrightness'
              ) && 'ActionSelected'}`}
            >
              <Icon name='flare' variant='material' />
            </div>
          </Tooltip>
          <div
            style={{ borderLeft: '4px groove #f4f4f4', margin: '10px 0px' }}
          />
          {state.matches('editingImage.main.brush') && (
            <>
              <div onClick={() => send('SET_BRUSH')} className='ImageIcons'>
                <label className='ImageIconLabel'>Brush size</label>
                <div style={{ display: 'flex', width: 80 }}>
                  <Slider
                    defaultValue={0}
                    value={state.context.brushSize}
                    showValue={false}
                    onChange={(value) =>
                      send('SET_BRUSH_SIZE', { value: value })
                    }
                    min={5}
                    max={30}
                  />
                </div>
              </div>
              <div
                onClick={() => {
                  colorRef?.current?.click();
                }}
                className='ImageIcons'
              >
                <Icon name='colorize' variant='material' />
              </div>
              <div
                onClick={() => send('LINE')}
                className={`ImageIcons ${state.matches(
                  'editingImage.main.brush.lineDrawing'
                ) && 'ActionSelected'}`}
              >
                <Icon name='Line' variant='material' />
              </div>
              <div
                onClick={() => send('FREE')}
                className={`ImageIcons ${state.matches(
                  'editingImage.main.brush.freeDrawing'
                ) && 'ActionSelected'}`}
              >
                <Icon name='gesture' variant='material' />
              </div>
            </>
          )}
          {state.matches('editingImage.main.crop') && (
            <>
              <Tooltip content='Apply crop'>
                <div onClick={() => send('APPLY_CROP')} className='ImageIcons'>
                  <Icon name='check_circle_outline' variant='material' />
                </div>
              </Tooltip>
              <Tooltip content='Reset crop'>
                <div onClick={() => send('RESET_CROP')} className='ImageIcons'>
                  <Icon name='crop_original' variant='material' />
                </div>
              </Tooltip>
            </>
          )}
          {state.matches('editingImage.main.setBrightness') && (
            <>
              <div className='ImageIcons'>
                <Tooltip content='Brightness'>
                  <Icon name='brightness_2' variant='material' />
                </Tooltip>
                <div style={{ display: 'flex', width: 120 }}>
                  <Slider
                    defaultValue={0}
                    showValue={false}
                    value={state.context.brightness}
                    onChange={(value) =>
                      send('SET_BRIGHTNESS', { value: value })
                    }
                    min={-255}
                    max={255}
                  />
                </div>
              </div>
              <div className='ImageIcons'>
                <Tooltip content='Contrast'>
                  <Icon name='brightness_6' variant='material' />
                </Tooltip>
                <div style={{ display: 'flex', width: 120 }}>
                  <Slider
                    defaultValue={0}
                    showValue={false}
                    value={state.context.contrast}
                    onChange={(value) => send('SET_CONTRAST', { value: value })}
                    min={-255}
                    max={255}
                  />
                </div>
              </div>
              <div className='ImageIcons'>
                <Tooltip content='Reset'>
                  <div
                    onClick={() => send('RESET_BRIGHTNESS')}
                    className='ImageIcons'
                  >
                    <Icon name='cancel' variant='material' />
                  </div>
                </Tooltip>
              </div>
            </>
          )}
          <div className='rightButtons'>
            {state.matches('editingImage.main.brush') && (
              <div className='ImageIcons' style={{ position: 'absolute' }}>
                <input
                  type='color'
                  onChange={(event) => {
                    send('SET_COLOR', { value: event.target.value });
                  }}
                  value={state.context.color}
                  style={{ width: 0, height: 0 }}
                  ref={colorRef}
                />
              </div>
            )}
            <Tooltip content='Undo'>
              <div
                onClick={() => !disableUndo && send('UNDO')}
                className={'ImageIcons'}
              >
                <Icon name='undo' variant='material' disable={disableUndo} />
              </div>
            </Tooltip>
            <Tooltip content='Redo'>
              <div onClick={() => send('REDO')} className={'ImageIcons'}>
                <Icon name='redo' variant='material' />
              </div>
            </Tooltip>
            <div
              style={{ borderLeft: '4px groove #f4f4f4', margin: '10px 0px' }}
            />
            <Tooltip content='Hand mode'>
              <div onClick={() => send('HAND_MODE')} className='ImageIcons'>
                <Icon name='pan_tool' variant='material' />
              </div>
            </Tooltip>
            <Tooltip content='Reset zoom'>
              <div onClick={() => send('RESET_ZOOM')} className='ImageIcons'>
                <Icon name='restart_alt' variant='material' />
              </div>
            </Tooltip>
            <Tooltip content='Zoom in'>
              <div onClick={() => send('ZOOM')} className={`ImageIcons`}>
                <Icon name='zoom_in' variant='material' />
              </div>
            </Tooltip>
          </div>
          {state.matches('editingImage') && (
            <div className="rightButtons">
              <div className="ImageIcons CancelButton">
                <Button onClick={() => send('BACK')}>
                  <span>CANCEL</span>
                </Button>
              </div>

              <div className={`ImageIcons ${state.nextEvents.includes('SAVE_EDITED_IMAGE') && 'SaveButton'}`}>
                <Button
                  onClick={(onSave) => send('SAVE_EDITED_IMAGE')}
                  disabled={!state.nextEvents.includes('SAVE_EDITED_IMAGE')}
                  primary
                >
                  <span>SAVE</span>
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      <div className='ImageEditorDialogFlex'>
        <div className='ImageEditorContainer'>
          <CoreImageEditor
            ref={editorRef}
            imageUrl={state.context.currentImageLink}
            cssMaxHeight={960}
            cssMaxWidth={1280}
            height={960}
            width={1280}
            imageLoaded={() => {
              send('IMAGE_LOADED');
            }}
            selectionStyle={{
              cornerSize: 20,
              rotatingPointOffset: 70,
            }}
            onObjectActivated={(obj) =>
              send('OBJECT_ACTIVATED', { id: obj.id, obj })
            }
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
