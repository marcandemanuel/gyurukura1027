// Hook for managing asset paths in React
export const useAssets = () => {
  const getImagePath = (imageName) => {
    // For images used in React components
    return `/src/assets/images/${imageName}`
  }

  const getPublicImagePath = (imageName) => {
    // For images served from public directory
    return `/images/${imageName}`
  }

  const getAudioPath = (audioName) => {
    return `/audio/${audioName}`
  }

  const getVideoPath = (videoName) => {
    return `/videos/${videoName}`
  }

  return {
    getImagePath,
    getPublicImagePath,
    getAudioPath,
    getVideoPath,
  }
}
