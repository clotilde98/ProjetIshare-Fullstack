import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Input, Button, Space, Modal, Form, message, Select, DatePicker } from "antd";
import { PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined, RollbackOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import Axios from "../services/api";
import dayjs from "dayjs"; 
import "../styles/body.css";


const { Option } = Select;


const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      } 
    `, 
  };
});

const Reservations = () => {
  const { styles } = useStyle();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReservations, setTotalReservations] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); 

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [deletingReservation, setDeletingReservation] = useState(null);
  const [mode, setMode] = useState('idle'); // 'idle', 'create', 'edit', 'delete'
  const [form] = Form.useForm();
   
  const fetchReservations = useCallback(async (page = 1, limit = 10, search = "", status = null) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search; 
      if (status) params.status = status;
      
      const res = await Axios.get("/reservations", { params });
      const rows = res.data && Array.isArray(res.data.rows) ? res.data.rows : [];
      const total = res.data?.total ?? 0;

      const reservationsData = rows.map(res => ({
        key: res.id,
        id: res.id,
        reservation_date: res.reservation_date,
        reservation_status: res.reservation_status,
        post_id: res.post_id,
        client_id: res.client_id,
      }));

      setReservations(reservationsData);
      setTotalReservations(total);
      setCurrentPage(page);
      setPageSize(limit);
    } catch (err) {
      console.error(err);
      message.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations(1, pageSize, searchText, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchReservations]);


  const handleTableChange = pagination => {
    const newPage = pagination.current;
    const newLimit = pagination.pageSize;
    fetchReservations(newPage, newLimit, searchText, statusFilter);
  };

  const handleSearch = e => {
    const value = e.target.value;
    setSearchText(value);
    fetchReservations(1, pageSize, value, statusFilter);
  };

  const handleStatusFilter = value => {
    setStatusFilter(value === 'all' ? null : value);
    fetchReservations(1, pageSize, searchText, value === 'all' ? null : value);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingReservation(null);
    setDeletingReservation(null);
    setMode('idle');
    form.resetFields();
  };
   
  // --- Fonctions de Modal (Style Catégories/Users) ---

  const handleAdd = () => {
    setEditingReservation(null);
    setMode('create');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = record => {
    setEditingReservation(record);
    setMode('edit');
    setIsModalVisible(true);
    
    // Pré-remplir le formulaire (utilisation de dayjs pour la date)
    form.setFieldsValue({
      reservation_status: record.reservation_status,
      post_id: record.post_id,
      client_id: record.client_id,
      reservation_date: record.reservation_date ? dayjs(record.reservation_date) : null,
    });
  };

  const handleDelete = record => {
    setDeletingReservation(record); 
    setMode('delete'); 
    setIsModalVisible(true); 
  };

  const handleDeleteSubmit = async () => {
      if (mode !== 'delete' || !deletingReservation || !deletingReservation.id) {
        message.error('Impossible de supprimer: ID manquant.');
        return;
      }
    
      try {
        await Axios.delete(`/reservations/${deletingReservation.id}`); 
        
        message.success('✅ Réservation supprimée avec succès');
        handleCancel(); 
        fetchReservations(currentPage, pageSize, searchText, statusFilter); 
      } catch (err) {
          console.error('Erreur de suppression:', err);
          message.error(err.response?.data?.message || `❌ Erreur lors de la suppression.`);
          handleCancel();
      }
  };


  const handleFormSubmit = async values => {
      const currentMode = mode;
      if (currentMode === 'delete') return;
    
    try {
      const payload = {
        reservation_status: values.reservation_status,
        post_id: values.post_id,
        client_id: values.client_id,
        // Convertir l'objet dayjs en chaîne ISO ou null pour l'API
        reservation_date: values.reservation_date ? values.reservation_date.toISOString() : undefined, 
      };

      if (currentMode === 'edit' && editingReservation) {
        await Axios.put(`/reservations/${editingReservation.id}`, payload);
        message.success("✅ Réservation mise à jour");
      } else if (currentMode === 'create') {
        // Pour la création, on laisse souvent la DB mettre NOW() pour la date si non fournie
        await Axios.post("/reservations", payload);
        message.success("✅ Réservation créée");
      }

      handleCancel();
      fetchReservations(currentMode === 'create' ? 1 : currentPage, pageSize, searchText, statusFilter);

    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "❌ Erreur opération");
    }
  };

  const tableColumns = useMemo(() => [
    { title: "ID", width: 80, dataIndex: "id", key: "id", fixed: "left" },
    { 
         title: "Date", 
         dataIndex: "reservation_date", 
         key: "reservation_date", 
         width: 140,
          render: text => {
            if (!text) return "N/A";
            try { return new Date(text).toLocaleDateString('fr-FR'); }
            catch { return "Date invalide"; }
          }
    },
    { 
         title: "Statut", 
         dataIndex: "reservation_status", 
         key: "reservation_status", 
         width: 120,
         render: status => (
            <span style={{ 
                color: status === 'confirmed' ? '#52c41a' : '#ff4d4f', 
                fontWeight: 'bold' 
            }}>
                {status.toUpperCase()}
            </span>
         )
    },
    { title: "ID Post", width: 100, dataIndex: "post_id", key: "post_id" },
    { title: "ID Client", width: 100, dataIndex: "client_id", key: "client_id" },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} size="small" />
        </Space>
      )
    }
  ], [handleEdit, handleDelete]);

  return (
    <div className="details-panel">
      <h6 className={styles.pageTitle}>Réservations</h6>
          <hr/>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search 
             placeholder="Rechercher (Client ou Post ID si API le permet)" 
             value={searchText} 
             onChange={handleSearch} 
             style={{ width: 300 }} 
        />
        <Select
          value={statusFilter || 'all'}
          onChange={handleStatusFilter}
          style={{ width: 180 }}
          placeholder="Filtrer par Statut"
          suffixIcon={<FilterOutlined />}
        >
          <Option value="all">Tous les Statuts</Option>
          <Option value="confirmed">Confirmée</Option>
          <Option value="cancelled">Annulée</Option>
        </Select>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Créer Réservation</Button>
      </Space>

      <Table
        tableLayout="fixed"
        className={styles.customTable}
        columns={tableColumns}
        dataSource={reservations}
        loading={loading}
        scroll={{ x: 800, y: 55 * 6 }}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalReservations,
          onChange: (page, size) => handleTableChange({ current: page, pageSize: size })
        }}
      />

      <Modal
        title={mode === 'delete' ? 'Confirmation de suppression' : editingReservation ? "Modifier la Réservation" : "Créer une Réservation"}
        open={isModalVisible}
        onCancel={handleCancel}
        closable={false}
        maskClosable={false}
        footer={
            mode === 'delete' ? [
                <Button key="cancel-del" onClick={handleCancel} icon={<RollbackOutlined />}>Annuler</Button>,
                <Button key="submit-del" type="primary" danger onClick={handleDeleteSubmit}>Supprimer</Button>
            ] : [
                <Button key="cancel" onClick={handleCancel} icon={<RollbackOutlined />}>Annuler</Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>{editingReservation ? 'Sauvegarder' : 'Créer'}</Button>
            ]
        }
      >
        {mode === 'delete' ? (
            <div>
                <p>Êtes-vous sûr de vouloir supprimer la réservation n° **{deletingReservation?.id || '—'}** ?</p>
                <p style={{ fontWeight: 'bold' }}>Post: {deletingReservation?.post_id || '—'}, Client: {deletingReservation?.client_id || '—'}</p>
            </div>
        ) : (
          <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFormSubmit}
                initialValues={{ reservation_status: 'confirmed' }}
            >
                <Form.Item name="post_id" label="ID du Post" rules={[{ required: true, message: "Veuillez entrer l'ID du post" }]}>
                  <Input type="number" />
                </Form.Item>

                <Form.Item name="client_id" label="ID du Client" rules={[{ required: true, message: "Veuillez entrer l'ID du client" }]}>
                  <Input type="number" />
                </Form.Item>
                
                <Form.Item name="reservation_status" label="Statut de la Réservation" rules={[{ required: true }]}>
                    <Select placeholder="Sélectionnez le statut">
                        <Option value="confirmed">Confirmée</Option>
                        <Option value="cancelled">Annulée</Option>
                    </Select>
                </Form.Item>
                
                <Form.Item 
                    name="reservation_date" 
                    label="Date de la Réservation (Laisser vide pour NOW())"
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>

          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Reservations;