import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import {
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  MessageSquare,
  User,
} from 'lucide-react-native';
import { useProviderStore } from '@/store/provider.store';

function TabIcon({
  icon,
  focused,
  badge,
}: {
  icon: React.ReactNode;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View className="relative items-center justify-center">
      {icon}
      {badge && badge > 0 ? (
        <View className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-danger items-center justify-center">
          <Text className="text-white text-[10px] font-bold">{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function DashboardLayout() {
  const { unreadCount } = useProviderStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tableau',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={<LayoutDashboard size={22} color={color} />} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Demandes',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={<ClipboardList size={22} color={color} />} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missions',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={<Briefcase size={22} color={color} />} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={<MessageSquare size={22} color={color} />}
              focused={focused}
              badge={unreadCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={<User size={22} color={color} />} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
