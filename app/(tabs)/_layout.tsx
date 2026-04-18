import { Tabs, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@/src/theme';

function TabIcon({ name, label, focused }: { name: string; label: string; focused: boolean }) {
  return (
    <>
      <Ionicons
        name={name as any}
        size={24}
        color={focused ? theme.colors.text : theme.colors.textSecondary}
      />
      {label}
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="book-outline" label="" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="units"
        options={{
          title: '错题本',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="list-outline" label="" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: '添加',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="add-circle"
              size={32}
              color={theme.colors.text}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/camera');
          },
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: '练习',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="create-outline" label="" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person-outline" label="" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
