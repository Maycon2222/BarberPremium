export async function fileToBase64(file, maxSizeMB = 2) {
  if (!file) return null
  if (file.size > maxSizeMB * 1024 * 1024) throw new Error(`Imagem maior que ${maxSizeMB}MB`)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function resizeImage(file, maxWidth = 800, quality = 0.85) {
  const dataUrl = await fileToBase64(file, 5)
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const ratio = Math.min(1, maxWidth / image.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * ratio)
      canvas.height = Math.round(image.height * ratio)
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    image.onerror = reject
    image.src = dataUrl
  })
}

export function generateAvatar(name = 'BP', size = 120) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'BP'
  const hue = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  context.fillStyle = `hsl(${hue}, 58%, 42%)`
  context.fillRect(0, 0, size, size)
  context.fillStyle = '#fff'
  context.font = `700 ${Math.round(size * 0.34)}px Arial`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(initials, size / 2, size / 2)
  return canvas.toDataURL('image/png')
}
