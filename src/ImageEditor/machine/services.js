export const anyUrlToFile = (url, filename, mimeType) =>
  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buffer) => new File([buffer], filename, { type: mimeType }))

