// @flow
import { locale } from '@copart/front-end-utils'
import labels from './labels'
import { storage } from '@copart/ops-tool-kit'

const dashboardState = storage.getLocalItem('dashboard') || {}
const { language = 'en' } = dashboardState
const { default: localeParser } = locale

export default localeParser(labels, language)
