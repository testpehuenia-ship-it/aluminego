const Jimp = require('jimp');

async function resizeImage() {
  try {
    const image = await Jimp.read('public/cascada-araucarias-Aluminé.jpg');
    // Open Graph standard is 1200x630
    await image
      .cover(1200, 630)
      .quality(75) // Reduce file size
      .writeAsync('public/og-cascada.jpg');
    console.log('Image resized and saved as og-cascada.jpg');
  } catch (error) {
    console.error('Error resizing image:', error);
  }
}

resizeImage();

