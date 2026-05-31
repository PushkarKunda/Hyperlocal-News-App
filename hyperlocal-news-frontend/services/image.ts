import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export interface CompressOptions {
  width?: number; // target width (px)
  height?: number; // target height (px)
  compress?: number; // 0-1
  format?: ImageManipulator.SaveFormat;
}

export const compressImage = async (uri: string, opts?: CompressOptions) => {
  const width = opts?.width ?? 512;
  const height = opts?.height ?? 512;
  const compress = opts?.compress ?? 0.8;
  const format = opts?.format ?? ImageManipulator.SaveFormat.JPEG;

  // Resize and compress keeping aspect ratio
  const actions: ImageManipulator.Action[] = [
    { resize: { width, height } },
  ];

  const result = await ImageManipulator.manipulateAsync(uri, actions, { compress, format, base64: false });
  return result; // { uri, width, height, type }
};

export const uriToFormData = async (uri: string, fieldName = 'file', filename?: string) => {
  // Create platform-friendly file object for multipart upload
  const fileName = filename ?? uri.split('/').pop() ?? `upload-${Date.now()}.jpg`;
  const uriForForm = Platform.OS === 'ios' && uri.startsWith('file://') ? uri : uri;

  const form = new FormData();
  // @ts-ignore - FormData file type for React Native
  form.append(fieldName, {
    uri: uriForForm,
    name: fileName,
    type: 'image/jpeg',
  });

  return form;
};
