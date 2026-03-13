import fs from 'fs';
import path from 'path';

const src = 'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\37b272e8-ed56-44e4-9371-0593ea0ef601\\hero_science_demo_1773420593681.png';
const dest = 'c:\\Users\\Asus\\Downloads\\E-Techexe.github.io-main\\E-Techexe.github.io-main\\public\\hero-image.png';
const oldFile = 'c:\\Users\\Asus\\Downloads\\E-Techexe.github.io-main\\E-Techexe.github.io-main\\public\\Gemini_Generated_Image_wy3mdewy3mdewy3m.png';

try {
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('Copied new image to ' + dest);
    } else {
        console.error('Source file not found: ' + src);
    }

    if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
        console.log('Deleted old file: ' + oldFile);
    }
} catch (err) {
    console.error('Error during file operations:', err);
}
