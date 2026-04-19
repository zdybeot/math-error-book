import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;

/**
 * 简易图片缩放预览组件
 * 基于 PanResponder 实现捏合缩放和拖拽，无第三方依赖
 */
interface ZoomableImageModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  children: (props: any) => React.ReactElement;
}

export default function ZoomableImageModal({ visible, imageUri, onClose, children }: ZoomableImageModalProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleVal = useRef(1);
  const panOffset = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const txVal = useRef(0);
  const tyVal = useRef(0);
  const lastDist = useRef(0);
  const lastCenter = useRef({ x: 0, y: 0 });
  const lastMove = useRef({ x: 0, y: 0 });
  const [showUI, setShowUI] = useState(true);

  if (!imageUri) return null;

  const getDist = (event: GestureResponderEvent) => {
    const { touches } = event.nativeEvent;
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (event: GestureResponderEvent) => {
    const { touches } = event.nativeEvent;
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].pageX + touches[1].pageX) / 2,
      y: (touches[0].pageY + touches[1].pageY) / 2,
    };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => scaleVal.current > 1,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { touches } = event.nativeEvent;
      lastMove.current = { x: touches[0].pageX, y: touches[0].pageY };
      if (touches.length === 2) {
        lastDist.current = getDist(event);
        lastCenter.current = getCenter(event);
      } else {
        panStart.current = {
          x: panOffset.current.x,
          y: panOffset.current.y,
        };
      }
    },
    onPanResponderMove: (event) => {
      const { touches } = event.nativeEvent;
      if (touches.length === 2) {
        // 双指缩放
        const dist = getDist(event);
        if (dist === 0) return;
        const ratio = dist / lastDist.current;
        const newScale = Math.max(1, Math.min(4, scaleVal.current * ratio));

        // 以双指中心点为缩放原点
        const centerX = lastCenter.current.x - SCREEN_W / 2;
        const centerY = lastCenter.current.y - SCREEN_H / 2;
        const dx = centerX * (newScale - scaleVal.current);
        const dy = centerY * (newScale - scaleVal.current);

        scale.setValue(newScale);
        translateX.setValue(panOffset.current.x - dx);
        translateY.setValue(panOffset.current.y - dy);
        txVal.current = panOffset.current.x - dx;
        tyVal.current = panOffset.current.y - dy;
        lastDist.current = dist;
        scaleVal.current = newScale;
      } else if (touches.length === 1) {
        // 单指拖拽
        const dx = touches[0].pageX - lastMove.current.x;
        const dy = touches[0].pageY - lastMove.current.y;
        lastMove.current = { x: touches[0].pageX, y: touches[0].pageY };
        const newTx = panStart.current.x + dx;
        const newTy = panStart.current.y + dy;
        translateX.setValue(newTx);
        translateY.setValue(newTy);
        txVal.current = newTx;
        tyVal.current = newTy;
      }
    },
    onPanResponderRelease: () => {
      panOffset.current = {
        x: txVal.current,
        y: tyVal.current,
      };

      // 如果缩放比例接近1，则回弹到1
      if (scaleVal.current < 1.1) {
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
        ]).start(() => {
          scaleVal.current = 1;
          panOffset.current = { x: 0, y: 0 };
        });
      }
    },
  });

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
    ]).start(() => {
      scaleVal.current = 1;
      panOffset.current = { x: 0, y: 0 };
      onClose();
    });
  };

  const handleTap = () => {
    if (scaleVal.current > 1.05) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
        Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
      ]).start(() => {
        scaleVal.current = 1;
        panOffset.current = { x: 0, y: 0 };
      });
    } else {
      setShowUI(!showUI);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleTap}
          {...panResponder.panHandlers}
        >
          {children({
            style: {
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
              width: SCREEN_W,
              height: SCREEN_H,
              resizeMode: 'contain',
            },
          })}
        </TouchableOpacity>

        {/* 顶部关闭栏 */}
        {showUI && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <TouchableOpacity onPress={handleClose} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
