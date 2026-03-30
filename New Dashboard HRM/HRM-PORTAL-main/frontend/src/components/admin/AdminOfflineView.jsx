import React from 'react';

const AdminOfflineView = () => {
  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Offline Requests</h1>
        <p className="page-sub">Pending manual approvals</p>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Requests</div>
        </div>
        <div className="panel-body">
          <p>No pending offline requests.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOfflineView;
