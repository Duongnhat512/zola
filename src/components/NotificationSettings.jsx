import React, { useState, useEffect } from 'react';
import { Switch, Card, Typography, Space, Button, message, Select } from 'antd';
import { BellOutlined, SoundOutlined, DesktopOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { requestNotificationPermission, playNotificationSound } from '../utils/notificationHelpers';

const { Title, Text } = Typography;

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    browserNotifications: false,
    soundNotifications: true,
    showPreview: true,
    notifyWhenActive: false,
    soundType: 'facebook',
  });
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    // Kiểm tra trạng thái quyền thông báo hiện tại
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    // Load cài đặt từ localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Lỗi khi load cài đặt thông báo:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const handleBrowserNotificationChange = async (checked) => {
    if (checked) {
      const granted = await requestNotificationPermission();
      if (granted) {
        saveSettings({ ...settings, browserNotifications: true });
        setPermissionStatus('granted');
        message.success('Đã bật thông báo trình duyệt');
      } else {
        message.error('Không thể bật thông báo trình duyệt. Vui lòng kiểm tra cài đặt trình duyệt.');
      }
    } else {
      saveSettings({ ...settings, browserNotifications: false });
      message.info('Đã tắt thông báo trình duyệt');
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Thông báo thử nghiệm', {
        body: 'Đây là thông báo thử nghiệm từ Zalo PC',
        icon: '/favicon.ico',
      });
      message.success('Đã gửi thông báo thử nghiệm');
    } else {
      message.error('Vui lòng bật quyền thông báo trước');
    }
  };

  const testSound = () => {
    playNotificationSound();
    message.success('Đã phát âm thanh thử nghiệm');
  };

  return (
    <Card title="Cài đặt thông báo" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Thông báo trình duyệt */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BellOutlined />
              <Text strong>Thông báo trình duyệt</Text>
            </div>
            <Switch
              checked={settings.browserNotifications && permissionStatus === 'granted'}
              onChange={handleBrowserNotificationChange}
              disabled={permissionStatus === 'denied'}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hiển thị thông báo khi có tin nhắn mới (ngay cả khi không ở trong ứng dụng)
          </Text>
          {permissionStatus === 'denied' && (
            <div style={{ marginTop: 4 }}>
              <Text type="danger" style={{ fontSize: 12 }}>
                Quyền thông báo đã bị từ chối. Vui lòng bật trong cài đặt trình duyệt.
              </Text>
            </div>
          )}
        </div>

        {/* Âm thanh thông báo */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SoundOutlined />
              <Text strong>Âm thanh thông báo</Text>
            </div>
            <Switch
              checked={settings.soundNotifications}
              onChange={(checked) => handleSettingChange('soundNotifications', checked)}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Phát âm thanh khi có tin nhắn mới
          </Text>
          
          {/* Chọn loại âm thanh */}
          {settings.soundNotifications && (
            <div style={{ marginTop: 12 }}>
              <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                Loại âm thanh:
              </Text>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Select
                  value={settings.soundType}
                  onChange={(value) => handleSettingChange('soundType', value)}
                  style={{ width: 150 }}
                  size="small"
                >
                  <Select.Option value="facebook">Facebook</Select.Option>
                  <Select.Option value="messenger">Messenger</Select.Option>
                  <Select.Option value="whatsapp">WhatsApp</Select.Option>
                  <Select.Option value="simple">Đơn giản</Select.Option>
                </Select>
                <Button 
                  size="small" 
                  icon={<PlayCircleOutlined />} 
                  onClick={testSound}
                  type="text"
                >
                  Thử
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hiển thị nội dung tin nhắn */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DesktopOutlined />
              <Text strong>Hiển thị nội dung tin nhắn</Text>
            </div>
            <Switch
              checked={settings.showPreview}
              onChange={(checked) => handleSettingChange('showPreview', checked)}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hiển thị nội dung tin nhắn trong thông báo
          </Text>
        </div>

        {/* Thông báo khi đang sử dụng ứng dụng */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BellOutlined />
              <Text strong>Thông báo khi đang sử dụng ứng dụng</Text>
            </div>
            <Switch
              checked={settings.notifyWhenActive}
              onChange={(checked) => handleSettingChange('notifyWhenActive', checked)}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hiển thị thông báo ngay cả khi đang ở trong ứng dụng
          </Text>
        </div>

        {/* Nút thử nghiệm */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={testNotification}>
            Thử nghiệm thông báo
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default NotificationSettings; 