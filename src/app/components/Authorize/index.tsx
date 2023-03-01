import React, { useState } from 'react';
import { Button, Row } from 'antd';
import { UserOutlined, LoadingOutlined } from '@ant-design/icons';

const Authorize = () => {
  const [loading, setLoading] = useState(false);
  onmessage = async (event) => {
    window.open(`http://localhost:3000/authorize?app=figma&state=${event?.data?.pluginMessage}`, '_blank');
    parent.postMessage({ pluginMessage: { success: true }, pluginId: '*' }, '*');
    setLoading(true);
  };

  if (loading)
    return (
      <Row style={{ justifyContent: 'center' }}>
        <LoadingOutlined style={{ fontSize: 30 }} size={25} spin={true} />
      </Row>
    );
  return (
    <Row>
      <Button type="primary" icon={<UserOutlined />} />
    </Row>
  );
};

export default Authorize;
