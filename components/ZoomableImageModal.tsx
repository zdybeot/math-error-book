import React, { useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

interface ZoomableImageModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

/**
 * 全屏图片预览组件，支持捏合缩放、双击放大、下拉关闭
 */
export default function ZoomableImageModal({ visible, imageUri, onClose }: ZoomableImageModalProps) {
  const [loaded, setLoaded] = useState(false);

  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <ImageViewer
        imageUrls={[{ url: imageUri }]}
        enableSwipeDown
        onSwipeDown={onClose}
        onClick={onClose}
        enableImageZoom
        minScale={1}
        maxScale={4}
        menuContext={{ saveToLocal: '保存', cancel: '取消' }}
        saveToLocalByLongPress={false}
        loadingRender={() => null}
        onShowModal={() => setLoaded(true)}
        onCancel={() => {
          setLoaded(false);
          onClose();
        }}
      />
    </Modal>
  );
}
