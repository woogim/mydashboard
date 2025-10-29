import React, { useState } from 'react';
import './StudentList.css';

const StudentList = ({ students, selectedStudentIndex, onSelectStudent, coachingStatus, coachingOrder, sortByOrder, onToggleSortByOrder, onUpdateOrder }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const getCoachingCount = (studentName) => {
    const status = coachingStatus[studentName] || { round1: false, round2: false, round3: false };
    const completed = [status.round1, status.round2, status.round3].filter(Boolean).length;
    return completed;
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // 새로운 순서 배열 생성
    const reorderedStudents = [...students];
    const [draggedStudent] = reorderedStudents.splice(draggedIndex, 1);
    reorderedStudents.splice(dropIndex, 0, draggedStudent);

    // 새로운 순서로 각 학습자에게 순서 번호 부여
    const newOrder = {};
    reorderedStudents.forEach((student, index) => {
      newOrder[student['성함']] = index + 1;
    });

    onUpdateOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="student-list">
      <div className="list-header">
        <div className="list-header-top">
          <h2>학습자 목록</h2>
          <span className="count">{students.length}명</span>
        </div>
        <button 
          className={`sort-button ${sortByOrder ? 'active' : ''}`}
          onClick={onToggleSortByOrder}
          title={sortByOrder ? '기본 순서로 보기 (드래그로 순서 변경 가능)' : '코칭 순서로 정렬'}
        >
          {sortByOrder ? '순서 정렬 ✓ (드래그 가능)' : '순서 정렬'}
        </button>
      </div>
      <div className="list-items">
        {students.length === 0 ? (
          <div className="empty-list">
            <p>엑셀 파일을 업로드하면<br/>학습자 목록이 표시됩니다</p>
          </div>
        ) : (
          students.map((student, index) => {
            const completedCount = getCoachingCount(student['성함']);
            const orderNum = coachingOrder[student['성함']];
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            
            return (
              <div
                key={index}
                className={`list-item ${selectedStudentIndex === index ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                onClick={() => onSelectStudent(index)}
                draggable={sortByOrder}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{ cursor: sortByOrder ? 'move' : 'pointer' }}
              >
                <div className="student-info-row">
                  <div className="student-name-with-order">
                    {sortByOrder && (
                      <span className="drag-handle" title="드래그하여 순서 변경">
                        ⋮⋮
                      </span>
                    )}
                    {orderNum && <span className="order-badge">{orderNum}</span>}
                    <span className="student-name">{student['성함'] || '이름 없음'}</span>
                  </div>
                  <div className="coaching-indicator">
                    <span className={`round ${completedCount >= 1 ? 'completed' : ''}`}>●</span>
                    <span className={`round ${completedCount >= 2 ? 'completed' : ''}`}>●</span>
                    <span className={`round ${completedCount >= 3 ? 'completed' : ''}`}>●</span>
                  </div>
                </div>
                <div className="student-meta">
                  {student['조 편성'] && (
                    <span className="meta-item">{student['조 편성']}</span>
                  )}
                  {student['담당 코치'] && (
                    <span className="meta-item">{student['담당 코치']}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentList;

