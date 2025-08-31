import { useRef } from "react";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { exportData, importData } from "../utils/dataManager";

const DataManager = ({ onDataImported }) => {
  const fileInputRef = useRef();

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importData(file);
        onDataImported?.();
        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
      }
    }
  };

  return (
    <div className="data-manager">
      <h3>Data Management</h3>
      <div className="data-actions">
        <button 
          className="btn btn--outline" 
          onClick={exportData}
        >
          <ArrowDownTrayIcon width={20} />
          <span>Export Data</span>
        </button>
        
        <button 
          className="btn btn--outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <ArrowUpTrayIcon width={20} />
          <span>Import Data</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default DataManager;