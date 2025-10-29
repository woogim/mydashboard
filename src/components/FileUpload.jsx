import React from 'react';
import * as XLSX from 'xlsx';
import './FileUpload.css';

const FileUpload = ({ onDataLoad, onClose }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // '사전 설문_수강생 공유' 시트 찾기
        const sheetName = '사전 설문_수강생 공유';
        
        if (!workbook.SheetNames.includes(sheetName)) {
          alert(`'${sheetName}' 시트를 찾을 수 없습니다.`);
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          alert('데이터가 없습니다.');
          return;
        }
        
        onDataLoad(jsonData);
      } catch (error) {
        console.error('파일 읽기 오류:', error);
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="file-upload-modal" onClick={onClose}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="upload-container">
          <label htmlFor="file-input" className="upload-label">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>엑셀 파일 선택</span>
            <small>클릭하여 파일을 선택하세요</small>
          </label>
          <input
            id="file-input"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

