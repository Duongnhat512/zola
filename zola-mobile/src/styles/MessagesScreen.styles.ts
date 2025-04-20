import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    tintColor: '#FFFFFF',
    marginRight: 6,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  tab: {
    marginRight: 20,
    paddingBottom: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0068FF',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#0068FF',
    fontWeight: 'bold',
  },
  activeTabIndicator: {
    height: 2,
    backgroundColor: '#0068FF',
    marginTop: 4,
  },
  filterContainer: {
    marginLeft: 'auto',
  },
  filterButton: {
    padding: 4,
  },
  chatList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  


});
