
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { 
  Bell, 
  Sun, 
  Thermometer, 
  Zap, 
  Layers, 
  Droplets, 
  Maximize2, 
  ArrowRight 
} from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Home = () => {
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Farm Overview</Text>
            <Text style={styles.headerSubtitle}>Monitor your agricultural sensors</Text>
          </View>

          <View style={styles.headerActions}>
            {/*  */}
            {/* <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View> */}
            <TouchableOpacity style={styles.iconButton}>
              <Bell color="#333" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherInfo}>
            <Sun color="#FDB813" size={40} fill="#FDB813" />
            <View style={styles.weatherTextContainer}>
              <Text style={styles.weatherTitle}>Today's Weather</Text>
              <Text style={styles.weatherSubtitle}>Sunny, 28°C • Low humidity</Text>
            </View>
          </View>
          <View style={styles.tempContainer}>
            <Text style={styles.tempValue}>28°C</Text>
            <Text style={styles.tempFeelsLike}>Feels like 30°C</Text>
          </View>
        </View>

        {/* Sensor Cards - Section 1 */}
        <MetricCard 
          title="Soil Temperature"
          value="24.5"
          unit="°C"
          icon={<Thermometer color="#F59E0B" size={24} />}
          bgColor="#FFF8E1" // Light Yellow
          iconBgColor="#FFFFFF"
          actionIcon={<Maximize2 color="#6B7280" size={16} />}
        />

        <MetricCard 
          title="Conductivity"
          value="2.4"
          unit="mS/cm"
          icon={<Zap color="#10B981" size={24} />}
          bgColor="#E8F5E9" // Light Green
          iconBgColor="#FFFFFF"
          actionIcon={<ArrowRight color="#6B7280" size={16} />}
        />

        {/* Sensor Cards - Section 2 (From second screenshot) */}
        <MetricCard 
          title="Soil Content"
          value="78"
          unit="%"
          icon={<Layers color="#8D6E63" size={24} />}
          bgColor="#F5EFE6" // Beige/Brownish
          iconBgColor="#FFFFFF"
          actionIcon={<Maximize2 color="#6B7280" size={16} />}
        />

        <MetricCard 
          title="Moisture Level"
          value="65"
          unit="%"
          icon={<Droplets color="#3B82F6" size={24} />}
          bgColor="#F0F9FF" // Very Light Blue/White
          iconBgColor="#FFFFFF"
          actionIcon={<Maximize2 color="#6B7280" size={16} />}
        />

        {/* Recent Readings Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Readings</Text>
          <Text style={styles.sectionSubtitle}>Latest sensor data from your farm</Text>
        </View>

        <View style={styles.readingsList}>
          <ReadingRow 
            time="2 mins ago" 
            temp="24.5°C" 
            cond="2.4 mS/cm" 
            moist="65%" 
          />
          <ReadingRow 
            time="5 mins ago" 
            temp="24.3°C" 
            cond="2.5 mS/cm" 
            moist="64%" 
          />
          <ReadingRow 
            time="8 mins ago" 
            temp="24.1°C" 
            cond="2.3 mS/cm" 
            moist="66%" 
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaProvider>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ title, value, unit, icon, bgColor, iconBgColor, actionIcon }) => (
  <View style={[styles.card, { backgroundColor: bgColor }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <TouchableOpacity>
        {actionIcon}
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardLabel}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardUnit}>{unit}</Text>
      </View>
    </View>
  </View>
);

// Reusable Reading Row Component
const ReadingRow = ({ time, temp, cond, moist }) => (
  <View style={styles.readingRow}>
    <View style={styles.readingTimeContainer}>
      <Text style={styles.readingTime}>{time}</Text>
    </View>
    
    <View style={styles.readingMetrics}>
      <View style={styles.metricItem}>
        <Thermometer size={14} color="#F59E0B" style={{ marginRight: 4 }} />
        <Text style={styles.metricText}>{temp}</Text>
      </View>
      
      <View style={styles.metricItem}>
        <Zap size={14} color="#10B981" style={{ marginRight: 4 }} />
        <Text style={styles.metricText}>{cond.split(' ')[0]}</Text> 
        {/* Simplified display for small space */}
      </View>
      
      <View style={styles.metricItem}>
        <Droplets size={14} color="#3B82F6" style={{ marginRight: 4 }} />
        <Text style={styles.metricText}>{moist}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    marginTop:30
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  iconButton: {
    padding: 4,
  },

  // Weather Card Styles
  weatherCard: {
    backgroundColor: '#D6E6F2', // Light blueish gradient feel
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherTextContainer: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  weatherSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  tempContainer: {
    alignItems: 'flex-end',
  },
  tempValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  tempFeelsLike: {
    fontSize: 12,
    color: '#475569',
  },

  // Metric Card Styles
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  cardContent: {
    marginTop: 12,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 4,
  },
  cardUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Recent Readings Styles
  sectionHeader: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  readingsList: {
    gap: 12,
  },
  readingRow: {
    backgroundColor: '#FFFFFF', // Clean white background for rows
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readingTimeContainer: {
    width: '25%',
  },
  readingTime: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  readingMetrics: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default Home;