import RNFS from 'react-native-fs';

// Import all icon assets at the top
import FolderIcon from '../assets/folder.png';
import PdfIcon from '../assets/pdf.png';
import AudioIcon from '../assets/music.png';
import VideoIcon from '../assets/ppt.png';
import DocIcon from '../assets/txt.png';

import DefaultIcon from '../assets/icon.png';

export type FileIcon = {
  name: string;
  color: string;
  source?: string | number; // Can be URI or imported asset
};

export const getFileIcon = async (
  file: RNFS.ReadDirItem,
): Promise<FileIcon> => {
  if (file.isDirectory()) {
    return {
      name: 'folder',
      color: '#FFA500', // Orange
      source: FolderIcon,
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Image files - use actual file as source
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(extension)) {
    return {
      name: 'image',
      color: '#4CAF50', // Green
      source: `file://${file.path}`, // Use actual file for thumbnails
    };
  }

  // Audio files
  if (['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(extension)) {
    return {
      name: 'musical-notes',
      color: '#9C27B0', // Purple
      source: AudioIcon,
    };
  }

  // Video files
  if (['mp4', 'mov', 'avi', 'mkv', 'flv'].includes(extension)) {
    return {
      name: 'film',
      color: '#2196F3', // Blue
      source: VideoIcon,
    };
  }

  // Documents
  switch (extension) {
    case 'pdf':
      return {
        name: 'document',
        color: '#F44336', // Red
        source: PdfIcon,
      };
    case 'doc':
    case 'docx':
      return {
        name: 'document',
        color: '#2B579A', // Office Blue
        source: DocIcon,
      };
    case 'txt':
    case 'md':
      return {
        name: 'document-text',
        color: '#607D8B', // Grey
        source: DocIcon,
      };
    default:
      return {
        name: 'document',
        color: '#795548', // Brown
        source: DefaultIcon,
      };
  }
};
