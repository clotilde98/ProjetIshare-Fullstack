import React, { useState } from "react";
import { Table, Input, Button, Space } from "antd";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";

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

const columns = [
  {
    title: "Titre Anonnce",
    width: 120,
    dataIndex: "name",
    key: "name",
    fixed: "left",
  },
  {
    title: "Bénéficiaire",
    width: 80,
    dataIndex: "age",
    key: "age",
    fixed: "left",
  },
  { title: "Date réservation", dataIndex: "address", key: "1", width: 150 },
  { title: "Statut", dataIndex: "address", key: "2", width: 150 },
  {
    title: "Action",
    key: "operation",
    fixed: "right",
    width: 100,
    render: () => <a>action</a>,
  },
];

const initialData = Array.from({ length: 100 }).map((_, i) => ({
  key: i,
  name: `Edward King ${i}`,
  age: 20 + (i % 30),
  address: `London, Park Lane no. ${i}`,
}));

const Reservation = () => {
  const { styles } = useStyle();
  const [dataSource, setDataSource] = useState(initialData);
  const [searchText, setSearchText] = useState("");

  // Filtrage par recherche
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = initialData.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.address.toLowerCase().includes(value)
    );
    setDataSource(filtered);
  };

  const handleFilter = () => {
    const filtered = initialData.filter((item) => item.age > 30);
    setDataSource(filtered);
  };

  const handleAdd = () => {
    const newItem = {
      key: dataSource.length + 1,
      name: `New User ${dataSource.length + 1}`,
      age: 25,
      address: `New Address ${dataSource.length + 1}`,
    };
    setDataSource([newItem, ...dataSource]);
  };

  return (
    <div className="details-panel">
      <h2>Réservations</h2>

      {/* Barre d’actions */}
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Ajouter
        </Button>
        <Input.Search
          placeholder="Rechercher..."
          value={searchText}
          onChange={handleSearch}
          style={{ width: 200 }}
        />
        <Button icon={<FilterOutlined />} onClick={handleFilter}>
          Filtrer
        </Button>
      </Space>

      {/* Tableau */}
      <Table
        tableLayout="fixed"
        className={styles.customTable}
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 1000, y: 55 * 5 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showQuickJumper: true,
        }}
      />
    </div>
  );
};

export default Reservation;
