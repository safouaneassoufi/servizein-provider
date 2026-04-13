import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import {
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  MessageSquare,
  User,
} from 'lucide-react-native';
import { useProviderStore } from '@/store/provider.store';

function BadgeDot({ count }: { count: number }) {
  if (!count) return null;
  return (
    <View
      style={{
        position: 'absolute',
        top: -4,
        right: -8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
}

function TabIcon({
  icon,
  badge = 0,
}: {
  icon: React.ReactNode;
  badge?: number;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {icon}
      <BadgeDot count={badge} />
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
          height: Platform.OS === 'ios' ? 80 : 64,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={<LayoutDashboard size={22} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Demandes',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={<ClipboardList size={22} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missions',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={<Briefcase size={22} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <TabIcon
              icon={<MessageSquare size={22} color={color} />}
              badge={unreadCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={<User size={22} color={color} />} />
          ),
        }}
      />
    </Tabs>
  );
}
