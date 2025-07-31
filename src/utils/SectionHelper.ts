import RNFS from 'react-native-fs';
// import { createThumbnail } from 'react-native-create-thumbnail';
// import PdfThumbnail from 'react-native-pdf-thumbnail';

export type FileIcon =
  | { name: 'folder',color:string }
  | { name: 'image'; source: string,color:string }
  | { name: 'film'; source: string,color:string }
  | { name: 'document'; source?: string,color:string }
  | { name: 'musical-notes',color:string }
  | { name: string,color:string }; // fallback

export const getFileIcon = async (
  file: RNFS.ReadDirItem,
): Promise<FileIcon> => {
  if (file.isDirectory()) {
    return { name: 'folder',color:"orange" };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    // 🖼️ Image preview
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return {
        name: 'image',
        source: `file://${file.path}`,
        color:"green"
      };

    // 📄 PDF thumbnail
    case 'pdf':
      try {
        // const { uri } = await PdfThumbnail.generate(`file://${file.path}`, 0);
        return {
          name: 'document',
        //   source: uri,
        color:"green"
        };
      } catch (e) {
        console.warn('PDF thumbnail error:', e);
        return { name: 'document',color:"green" };
      }

    // 🎥 Video thumbnail
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      try {
        // const { path: thumbPath } = await createThumbnail({
        //   url: `file://${file.path}`,
        // });
        return {
          name: 'film',
        //   source: thumbPath,
        color:"green"
        };
      } catch (e) {
        console.warn('Video thumbnail error:', e);
        return { name: 'film',color:"blue" };
      }

    // 🎵 Audio
    case 'mp3':
    case 'wav':
    case 'aac':
    case 'flac':
      return { name: 'musical-notes',color:"grey" };

    // 🧾 Other file types
    case 'txt':
    case 'md':
    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
    case 'ppt':
    case 'pptx':
    case 'zip':
    case 'rar':
    case '7z':
      return { name: 'document',color:"green" };

   
    default:
      return { name: 'document',color:"green" };
  }
};
