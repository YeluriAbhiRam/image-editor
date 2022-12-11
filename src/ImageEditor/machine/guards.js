export const hasReachedLastImage = (ctx) => ctx.counter === ctx.sequences.length - 1

export const noPendingImage = (ctx) => !ctx.currentFile?.pending?.link

export const canBackgroundUpload = () => true
