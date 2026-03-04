import { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { categoriesApi } from '../services/api';

interface CategoryNode {
  id: string;
  key: string;
  title: string;
  name: string;
  description?: string;
  children?: CategoryNode[];
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getTree();
      const treeData = convertToTreeData(res.data);
      setCategories(treeData);
    } catch (error) {
      message.error('获取分类失败');
    } finally {
      setLoading(false);
    }
  };

  const convertToTreeData = (data: any[]): CategoryNode[] => {
    return data.map((item) => ({
      id: item.id,
      key: item.id,
      title: item.name,
      name: item.name,
      description: item.description,
      children: item.children ? convertToTreeData(item.children) : undefined,
    }));
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = { ...values, parentId };
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, data);
        message.success('分类更新成功');
      } else {
        await categoriesApi.create(data);
        message.success('分类创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      setParentId(null);
      fetchCategories();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      message.success('分类删除成功');
      fetchCategories();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const renderTreeTitle = (node: CategoryNode) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{node.name}</span>
      <Space>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setParentId(node.id);
            setEditingCategory(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          添加子分类
        </Button>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setEditingCategory(node);
            form.setFieldsValue({
              name: node.name,
              description: node.description,
            });
            setModalVisible(true);
          }}
        />
        <Popconfirm
          title="确定删除这个分类吗？"
          onConfirm={(e) => {
            e?.stopPropagation();
            handleDelete(node.id);
          }}
        >
          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    </div>
  );

  const treeDataWithActions = (data: CategoryNode[]): any[] => {
    return data.map((item) => ({
      ...item,
      title: renderTreeTitle(item),
      children: item.children ? treeDataWithActions(item.children) : undefined,
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>分类管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setParentId(null);
            setEditingCategory(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          新建分类
        </Button>
      </div>

      <Card loading={loading}>
        <Tree
          treeData={treeDataWithActions(categories)}
          defaultExpandAll
          showIcon
          icon={<FolderOutlined />}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          setParentId(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="分类名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="分类描述" />
          </Form.Item>

          <Form.Item name="coverImage" label="封面图片 URL">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
