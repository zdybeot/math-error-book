import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/src/theme';
import { units } from '@/src/data/units';
import { useData, getPendingPhoto, setPendingPhoto } from '@/src/contexts/DataContext';
import { ocrMathError, predictUnit } from '@/src/services/ocr';
import { AI_API_KEY } from '@/src/config/ai';
import ZoomableImageModal from '@/components/ZoomableImageModal';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ExtractScreen() {
  const { addError } = useData();

  // 从全局状态获取图片 URI
  const initialPhoto = getPendingPhoto();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(initialPhoto);

  // 照片放大预览
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  // OCR 状态
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  // 有照片时自动识别
  useEffect(() => {
    if (photoUri && AI_API_KEY && !question) {
      handleOcr();
    }
  }, []);

  /** 调用 OCR 识别 */
  const handleOcr = async () => {
    if (!photoUri) return;

    if (!AI_API_KEY) {
      setOcrError('未配置 API Key，请在 src/config/ai.ts 中填入');
      return;
    }

    setOcrLoading(true);
    setOcrError('');

    try {
      const result = await ocrMathError(photoUri, AI_API_KEY);
      setQuestion(result.question);
      setAnswer(result.correctAnswer);
      setExplanation(result.explanation);
      setStepsText(result.steps.join('\n'));
      // OCR 识别成功后自动预测所属单元
      predictUnit(result.question, units).then(unitId => {
        setSelectedUnit(unitId);
      });
    } catch (e: any) {
      setOcrError(e?.message || '识别失败，请手动输入');
    } finally {
      setOcrLoading(false);
    }
  };

  /** 重新选图裁剪 */
  const handleRecrop = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      // 清除已有内容
      setQuestion('');
      setAnswer('');
      setExplanation('');
      setStepsText('');
      setOcrError('');
      // 重新识别
      setTimeout(() => {
        if (AI_API_KEY) handleOcr();
      }, 100);
    }
  };

  /** 重新拍照 */
  const handleRetake = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setQuestion('');
      setAnswer('');
      setExplanation('');
      setStepsText('');
      setOcrError('');
      setTimeout(() => {
        if (AI_API_KEY) handleOcr();
      }, 100);
    }
  };

  const handleSave = () => {
    if (!question.trim()) return;
    addError({
      question: question.trim(),
      userAnswer: '',
      correctAnswer: answer.trim() || '—',
      explanation: explanation.trim(),
      steps: stepsText.split('\n').filter(s => s.trim()),
      photoUri: photoUri,
      unitId: selectedUnit,
      tags: [units.find(u => u.id === selectedUnit)?.name || ''],
      status: 'unmastered',
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 导航栏 */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>添加错题</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          {/* 照片区域 */}
          {photoUri ? (
            <View style={styles.card}>
              <View style={styles.photoHeader}>
                <Text style={styles.cardLabel}>错题照片</Text>
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoActionBtn} onPress={handleRecrop}>
                    <Ionicons name="images-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.photoActionText}>重选</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoActionBtn} onPress={handleRetake}>
                    <Ionicons name="camera-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.photoActionText}>重拍</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.photoPreview}
                activeOpacity={0.7}
                onPress={() => setPhotoModalVisible(true)}
              >
                <Image
                  source={{ uri: photoUri! }}
                  style={styles.photoPreview}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={styles.hint}>点击照片放大，手指捏合可缩放</Text>

              {/* OCR 状态 */}
              {ocrLoading && (
                <View style={styles.ocrStatus}>
                  <ActivityIndicator size="small" color={theme.colors.accent} />
                  <Text style={styles.ocrText}>AI 识别中...</Text>
                </View>
              )}
              {ocrError && (
                <View style={styles.ocrError}>
                  <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
                  <Text style={styles.ocrErrorText}>{ocrError}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={handleOcr}>
                    <Ionicons name="refresh-outline" size={16} color="white" />
                    <Text style={styles.retryBtnText}>重新识别</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.addPhotoCard} onPress={() => router.replace('/camera')}>
              <Ionicons name="camera-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.addPhotoText}>添加错题照片</Text>
              <Text style={styles.addPhotoHint}>拍照或从相册选择</Text>
            </TouchableOpacity>
          )}

          {/* 题目输入 */}
          <View style={styles.card}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabel}>题目</Text>
              {photoUri && AI_API_KEY && (
                <TouchableOpacity onPress={handleOcr} disabled={ocrLoading}>
                  <Text style={[styles.aiBtn, ocrLoading && styles.aiBtnDisabled]}>
                    AI 识别
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="输入错题题目内容"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={question}
              onChangeText={setQuestion}
            />
          </View>

          {/* 答案输入 */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>正确答案</Text>
            <TextInput
              style={styles.input}
              placeholder="输入正确答案"
              placeholderTextColor={theme.colors.textSecondary}
              value={answer}
              onChangeText={setAnswer}
            />
          </View>

          {/* 解析输入 */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>解析（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="输入解析说明"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={explanation}
              onChangeText={setExplanation}
            />
          </View>

          {/* 解题步骤 */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>解题步骤（可选，每行一条）</Text>
            <TextInput
              style={[styles.input, { minHeight: 100 }]}
              placeholder={"步骤1\n步骤2\n步骤3"}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={stepsText}
              onChangeText={setStepsText}
            />
          </View>

          {/* 单元选择 */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>选择所属单元</Text>
            <View style={styles.tagRow}>
              {units.map(unit => (
                <TouchableOpacity
                  key={unit.id}
                  style={[styles.tag, selectedUnit === unit.id && styles.tagSelected]}
                  onPress={() => setSelectedUnit(unit.id)}
                >
                  <Text style={[styles.tagText, selectedUnit === unit.id && styles.tagTextSelected]}>
                    {unit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* 底部保存按钮 */}
        <View style={styles.saveBar}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>保存</Text>
          </TouchableOpacity>
        </View>

        {/* 照片放大预览（支持捏合缩放） */}
        <ZoomableImageModal
          visible={photoModalVisible}
          imageUri={photoUri}
          onClose={() => setPhotoModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.bg },
  container: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: theme.fontSize['2xl'], fontWeight: '600', flex: 1, marginLeft: theme.spacing.md },
  skipBtn: { paddingHorizontal: theme.spacing.md },
  skipBtnText: { fontSize: theme.fontSize.lg, color: theme.colors.accent, fontWeight: '600' },
  body: { flex: 1, padding: theme.spacing.lg, marginBottom: 80 },
  // 底部保存栏
  saveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: theme.fontSize['2xl'], color: 'white', fontWeight: '700' },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  aiBtn: { fontSize: theme.fontSize.sm, color: theme.colors.accent, fontWeight: '600', paddingHorizontal: theme.spacing.sm, paddingVertical: 2, backgroundColor: theme.colors.accentLight, borderRadius: 4 },
  aiBtnDisabled: { opacity: 0.5 },
  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  photoActions: { flexDirection: 'row', gap: theme.spacing.md },
  photoActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoActionText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  photoPreview: { width: '100%', height: 200, backgroundColor: theme.colors.accentLight, borderRadius: theme.radius.sm },
  hint: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
  ocrStatus: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  ocrText: { fontSize: theme.fontSize.base, color: theme.colors.accent },
  ocrError: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm, flexWrap: 'wrap' },
  ocrErrorText: { fontSize: theme.fontSize.base, color: theme.colors.danger, flex: 1 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },
  retryBtnText: { fontSize: theme.fontSize.sm, color: 'white', fontWeight: '500' },
  addPhotoCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  addPhotoText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary },
  addPhotoHint: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary },
  input: { fontSize: theme.fontSize.xl, minHeight: 60, textAlignVertical: 'top' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  tag: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, backgroundColor: theme.colors.card },
  tagSelected: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentLight },
  tagText: { fontSize: theme.fontSize.base },
  tagTextSelected: { color: theme.colors.text, fontWeight: '500' },
});
