import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

export default function DashboardLayout({ building, title, children, activeView, onNavigate }) {
  return (
    <div className="dashboard-layout">
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <div className="dashboard-main">
        <Topbar building={building} title={title} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
