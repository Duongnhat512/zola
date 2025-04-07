import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: "#006AF5",
    height: 48,
    width: '100%',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Nếu bạn dùng React Native >= 0.71
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    gap: 15,
  },
  icon2: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '500',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#000',
  },
  filterContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 16,
    justifyContent: 'center',
  },
  filterButton: {
    padding: 5,
  },
  chatItem: {

  },
  chatList: {
    padding: 16,
  }
});

export default styles; 