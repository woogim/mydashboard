import React, { useState, useEffect } from 'react';
import './StudentDetail.css';

const StudentDetail = ({ student, memos, onAddMemo, onDeleteMemo, onEditMemo, coachingStatus, onToggleCoaching, annotations, onUpdateAnnotations, coachingOrder, onSetCoachingOrder }) => {
  const [newMemo, setNewMemo] = useState('');
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [editingMemoText, setEditingMemoText] = useState('');
  const [textTooltip, setTextTooltip] = useState(null);
  const [fieldAnnotations, setFieldAnnotations] = useState(annotations);
  const [orderInput, setOrderInput] = useState('');

  useEffect(() => {
    setFieldAnnotations(annotations);
  }, [annotations]);

  useEffect(() => {
    setOrderInput(coachingOrder ? String(coachingOrder) : '');
  }, [coachingOrder, student]);

  if (!student) {
    return (
      <div className="student-detail">
        <div className="empty-state">
          <p>학습자를 선택해주세요</p>
        </div>
      </div>
    );
  }

  const fields = [
    { key: '해결과제', label: '해결과제' },
    { key: '희망 솔루션', label: '희망 솔루션' },
    { key: '현재 방식', label: '현재 방식' },
    { key: '개선 시도', label: '개선 시도' },
    { key: '기대효과', label: '기대효과' },
  ];

  const handleSubmitMemo = (e) => {
    e.preventDefault();
    if (newMemo.trim()) {
      onAddMemo(student['성함'], newMemo.trim());
      setNewMemo('');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartEdit = (memo) => {
    setEditingMemoId(memo.id);
    setEditingMemoText(memo.text);
  };

  const handleSaveEdit = () => {
    if (editingMemoText.trim()) {
      onEditMemo(student['성함'], editingMemoId, editingMemoText.trim());
    }
    setEditingMemoId(null);
    setEditingMemoText('');
  };

  const handleCancelEdit = () => {
    setEditingMemoId(null);
    setEditingMemoText('');
  };

  const handleOrderChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setOrderInput(value);
    }
  };

  const handleOrderSave = () => {
    const orderNum = orderInput === '' ? null : parseInt(orderInput, 10);
    onSetCoachingOrder(student['성함'], orderNum);
  };

  const handleTextSelection = (fieldKey, e) => {
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setTextTooltip({
          text: selectedText,
          fieldKey: fieldKey,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
          range: range,
        });
      } else {
        setTextTooltip(null);
      }
    }, 10);
  };

  const closeTooltip = () => {
    setTextTooltip(null);
  };

  const applyStyle = (styleType) => {
    if (!textTooltip) return;
    
    const { fieldKey, text } = textTooltip;
    const currentAnnotations = fieldAnnotations[fieldKey] || [];
    
    const newAnnotation = {
      id: Date.now(),
      text: text,
      style: styleType,
      timestamp: new Date().toISOString(),
    };
    
    const updatedAnnotations = {
      ...fieldAnnotations,
      [fieldKey]: [...currentAnnotations, newAnnotation],
    };
    
    setFieldAnnotations(updatedAnnotations);
    onUpdateAnnotations(student['성함'], updatedAnnotations);
    
    setTextTooltip(null);
    window.getSelection().removeAllRanges();
  };

  const applyMemoToText = () => {
    if (!textTooltip) return;
    
    const memoText = prompt('메모 내용을 입력하세요:');
    if (memoText && memoText.trim()) {
      const { fieldKey, text } = textTooltip;
      const currentAnnotations = fieldAnnotations[fieldKey] || [];
      
      const newAnnotation = {
        id: Date.now(),
        text: text,
        style: 'memo',
        memo: memoText.trim(),
        timestamp: new Date().toISOString(),
      };
      
      const updatedAnnotations = {
        ...fieldAnnotations,
        [fieldKey]: [...currentAnnotations, newAnnotation],
      };
      
      setFieldAnnotations(updatedAnnotations);
      onUpdateAnnotations(student['성함'], updatedAnnotations);
    }
    
    setTextTooltip(null);
    window.getSelection().removeAllRanges();
  };

  const removeAnnotation = (fieldKey, annotationId) => {
    const updatedAnnotations = {
      ...fieldAnnotations,
      [fieldKey]: (fieldAnnotations[fieldKey] || []).filter(a => a.id !== annotationId),
    };
    
    setFieldAnnotations(updatedAnnotations);
    onUpdateAnnotations(student['성함'], updatedAnnotations);
  };

  const renderAnnotatedText = (text, fieldKey) => {
    const annotations = fieldAnnotations[fieldKey] || [];
    if (annotations.length === 0) return text;
    
    let result = text;
    annotations.forEach((annotation) => {
      const styleClass = annotation.style === 'bold' ? 'text-bold' :
                        annotation.style === 'highlight' ? 'text-highlight' :
                        annotation.style === 'underline' ? 'text-underline' :
                        annotation.style === 'memo' ? 'text-memo' : '';
      
      const title = annotation.style === 'memo' ? ` title="${annotation.memo}"` : '';
      const escapedText = annotation.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedText})`, 'g');
      
      result = result.replace(regex, `<span class="${styleClass}"${title}>$1</span>`);
    });
    
    return result;
  };

  return (
    <div className="student-detail">
      <div className="detail-header">
        <h1>{student['성함'] || '이름 없음'}</h1>
        <div className="header-info">
          {student['조 편성'] && <span>{student['조 편성']}</span>}
          {student['담당 코치'] && <span>담당: {student['담당 코치']}</span>}
        </div>
      </div>

      <div className="detail-content">
        <div className="coaching-section">
          <div className="coaching-status-row">
            <div className="coaching-status-left">
              <h3>코칭 진행 상황</h3>
              <div className="coaching-checkboxes">
                <label className="coaching-checkbox">
                  <input
                    type="checkbox"
                    checked={coachingStatus.round1}
                    onChange={() => onToggleCoaching(student['성함'], 'round1')}
                  />
                  <span>1차 코칭 완료</span>
                </label>
                <label className="coaching-checkbox">
                  <input
                    type="checkbox"
                    checked={coachingStatus.round2}
                    onChange={() => onToggleCoaching(student['성함'], 'round2')}
                  />
                  <span>2차 코칭 완료</span>
                </label>
                <label className="coaching-checkbox">
                  <input
                    type="checkbox"
                    checked={coachingStatus.round3}
                    onChange={() => onToggleCoaching(student['성함'], 'round3')}
                  />
                  <span>3차 코칭 완료</span>
                </label>
              </div>
            </div>
            <div className="coaching-order">
              <label>코칭 순서</label>
              <div className="order-input-group">
                <input
                  type="text"
                  value={orderInput}
                  onChange={handleOrderChange}
                  placeholder="순서"
                  maxLength="3"
                />
                <button onClick={handleOrderSave}>저장</button>
              </div>
            </div>
          </div>
        </div>

        {fields.map((field) => {
          const value = student[field.key];
          if (!value) return null;

          const annotations = fieldAnnotations[field.key] || [];

          return (
            <div key={field.key} className="detail-section">
              <h3>{field.label}</h3>
              <div 
                className="field-content"
                onMouseUp={(e) => handleTextSelection(field.key, e)}
                dangerouslySetInnerHTML={{ __html: renderAnnotatedText(value, field.key) }}
              />
              {annotations.length > 0 && (
                <div className="annotations-list">
                  {annotations.map((annotation) => (
                    <div key={annotation.id} className="annotation-item">
                      <span className="annotation-text">"{annotation.text}"</span>
                      <span className="annotation-type">
                        {annotation.style === 'bold' && '굵음'}
                        {annotation.style === 'highlight' && '형광펜'}
                        {annotation.style === 'underline' && '밑줄'}
                        {annotation.style === 'memo' && `메모: ${annotation.memo}`}
                      </span>
                      <button
                        className="annotation-remove"
                        onClick={() => removeAnnotation(field.key, annotation.id)}
                      >
                        제거
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="memo-section">
          <h3>메모</h3>
          
          <form onSubmit={handleSubmitMemo} className="memo-form">
            <textarea
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
              placeholder="메모를 입력하세요..."
              rows="3"
            />
            <button type="submit" disabled={!newMemo.trim()}>
              메모 추가
            </button>
          </form>

          <div className="memo-list">
            {memos.length === 0 ? (
              <p className="no-memos">등록된 메모가 없습니다</p>
            ) : (
              memos.map((memo) => (
                <div key={memo.id} className="memo-item">
                  <div className="memo-header">
                    <span className="memo-date">{formatDate(memo.timestamp)}</span>
                    <div className="memo-actions">
                      {editingMemoId === memo.id ? (
                        <>
                          <button
                            className="memo-save"
                            onClick={handleSaveEdit}
                          >
                            저장
                          </button>
                          <button
                            className="memo-cancel"
                            onClick={handleCancelEdit}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="memo-edit"
                            onClick={() => handleStartEdit(memo)}
                          >
                            수정
                          </button>
                          <button
                            className="memo-delete"
                            onClick={() => onDeleteMemo(student['성함'], memo.id)}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingMemoId === memo.id ? (
                    <textarea
                      className="memo-edit-textarea"
                      value={editingMemoText}
                      onChange={(e) => setEditingMemoText(e.target.value)}
                      rows="3"
                    />
                  ) : (
                    <p className="memo-text">{memo.text}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {textTooltip && (
        <>
          <div className="text-tooltip-overlay" onClick={closeTooltip} />
          <div
            className="text-tooltip"
            style={{
              position: 'fixed',
              left: `${textTooltip.x}px`,
              top: `${textTooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button onClick={() => applyStyle('bold')} title="굵게 표시">
              <strong>B</strong>
            </button>
            <button onClick={() => applyStyle('highlight')} title="형광펜">
              <span style={{ backgroundColor: '#fff59d', padding: '2px 4px' }}>H</span>
            </button>
            <button onClick={() => applyStyle('underline')} title="밑줄">
              <u>U</u>
            </button>
            <button onClick={applyMemoToText} title="메모 추가">
              M
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDetail;

