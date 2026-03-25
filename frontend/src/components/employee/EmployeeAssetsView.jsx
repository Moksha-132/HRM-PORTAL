import React, { useEffect, useState } from 'react';
import { getAssets } from '../../services/employeeService';

const EmployeeAssetsView = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAssets();
        if (active && res.success) setAssets(res.data);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Assigned Equipment</h1>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">My Assets</div>
        </div>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Serial Number</th>
                <th>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    Loading assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    No assets assigned
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.asset_id}>
                    <td>{asset.asset_name}</td>
                    <td>{asset.asset_category}</td>
                    <td>{asset.serial_number || 'N/A'}</td>
                    <td>{asset.assignment_date || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAssetsView;
