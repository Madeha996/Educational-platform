import React, { useState, useEffect, useCallback } from 'react';
import { Popconfirm, Form, TablePaginationConfig, Space } from 'antd';
import { Table } from 'components/common/Table/Table';
import { getEditableTableData, BasicTableRow, Pagination } from 'api/table.api';
import { EditableCell } from './EditableCell';
import { Button } from 'components/common/buttons/Button/Button';
import { useTranslation } from 'react-i18next';
import { useMounted } from '@app/hooks/useMounted';
import { Switch } from '@app/components/common/Switch/Switch';
import * as S from '@app/pages/uiComponentsPages//UIComponentsPage.styles';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 4,
};

export const EditableTable: React.FC = () => {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<{ data: BasicTableRow[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [editingKey, setEditingKey] = useState(0);
  const { t } = useTranslation();
  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getEditableTableData(pagination).then((res) => {
        if (isMounted.current) {
          setTableData({ data: res.data, pagination: res.pagination, loading: false });
        }
      });
    },
    [isMounted],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const isEditing = (record: BasicTableRow) => record.key === editingKey;

  const edit = (record: Partial<BasicTableRow> & { key: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey(0);
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as BasicTableRow;

      const newData = [...tableData.data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
      } else {
        newData.push(row);
      }
      setTableData({ ...tableData, data: newData });
      setEditingKey(0);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDeleteRow = (rowId: number) => {
    setTableData({ ...tableData, data: tableData.data.filter((item) => item.key !== rowId) });
  };

  const columns = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    // {
    //   title: t('common.age'),
    //   dataIndex: 'age',
    //   width: '15%',
    //   editable: true,
    // },
    {
      title: t('common.address'),
      dataIndex: 'address',
      width: '30%',
      editable: true,
    },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.key)}>
                  {t('common.save')}
                </Button>
                <Popconfirm title={t('tables.cancelInfo')} onConfirm={cancel}>
                  <Button type="ghost">{t('common.cancel')}</Button>
                </Popconfirm>
              </>
            ) : (
              <>
                <Button type="ghost" icon={<EditOutlined />} disabled={editingKey !== 0} onClick={() => edit(record)} />
                <Button type="default" icon={<DeleteOutlined />} danger onClick={() => handleDeleteRow(record.key)} />
                {/* <Switch defaultChecked /> */}
                <Button>
                  <Switch />
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: BasicTableRow) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={tableData.data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          ...tableData.pagination,
          onChange: cancel,
        }}
        onChange={handleTableChange}
        loading={tableData.loading}
        scroll={{ x: 800 }}
      />
    </Form>
  );
};
