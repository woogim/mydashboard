import React, { useState, useMemo, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('전체');
  const [showUpload, setShowUpload] = useState(false);
  const [memos, setMemos] = useState({});
  const [coachingStatus, setCoachingStatus] = useState({});
  const [annotations, setAnnotations] = useState({});
  const [coachingOrder, setCoachingOrder] = useState({});
  const [sortByOrder, setSortByOrder] = useState(false);

  // localStorage에서 메모 불러오기
  useEffect(() => {
    const savedMemos = localStorage.getItem('studentMemos');
    if (savedMemos) {
      setMemos(JSON.parse(savedMemos));
    }
  }, []);

  // localStorage에서 코칭 상태 불러오기
  useEffect(() => {
    const savedCoachingStatus = localStorage.getItem('coachingStatus');
    if (savedCoachingStatus) {
      setCoachingStatus(JSON.parse(savedCoachingStatus));
    }
  }, []);

  // localStorage에서 주석 불러오기
  useEffect(() => {
    const savedAnnotations = localStorage.getItem('textAnnotations');
    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations));
    }
  }, []);

  // localStorage에서 코칭 순서 불러오기
  useEffect(() => {
    const savedCoachingOrder = localStorage.getItem('coachingOrder');
    if (savedCoachingOrder) {
      setCoachingOrder(JSON.parse(savedCoachingOrder));
    }
  }, []);

  // 메모 저장
  useEffect(() => {
    localStorage.setItem('studentMemos', JSON.stringify(memos));
  }, [memos]);

  // 코칭 상태 저장
  useEffect(() => {
    localStorage.setItem('coachingStatus', JSON.stringify(coachingStatus));
  }, [coachingStatus]);

  // 주석 저장
  useEffect(() => {
    localStorage.setItem('textAnnotations', JSON.stringify(annotations));
  }, [annotations]);

  // 코칭 순서 저장
  useEffect(() => {
    localStorage.setItem('coachingOrder', JSON.stringify(coachingOrder));
  }, [coachingOrder]);

  const handleDataLoad = (data) => {
    setStudents(data);
    if (data.length > 0) {
      setSelectedStudentIndex(0);
    }
    setShowUpload(false);
  };

  const handleReset = () => {
    setStudents([]);
    setSelectedStudentIndex(null);
    setSelectedGroup('전체');
    setShowUpload(true);
  };

  const handleAddMemo = (studentName, memo) => {
    setMemos((prev) => ({
      ...prev,
      [studentName]: [...(prev[studentName] || []), {
        id: Date.now(),
        text: memo,
        timestamp: new Date().toISOString(),
      }],
    }));
  };

  const handleDeleteMemo = (studentName, memoId) => {
    setMemos((prev) => ({
      ...prev,
      [studentName]: (prev[studentName] || []).filter((m) => m.id !== memoId),
    }));
  };

  const handleEditMemo = (studentName, memoId, newText) => {
    setMemos((prev) => ({
      ...prev,
      [studentName]: (prev[studentName] || []).map((m) =>
        m.id === memoId ? { ...m, text: newText } : m
      ),
    }));
  };

  const handleToggleCoaching = (studentName, round) => {
    setCoachingStatus((prev) => {
      const current = prev[studentName] || { round1: false, round2: false, round3: false };
      return {
        ...prev,
        [studentName]: {
          ...current,
          [round]: !current[round],
        },
      };
    });
  };

  const handleUpdateAnnotations = (studentName, fieldAnnotations) => {
    setAnnotations((prev) => ({
      ...prev,
      [studentName]: fieldAnnotations,
    }));
  };

  const handleSetCoachingOrder = (studentName, order) => {
    setCoachingOrder((prev) => ({
      ...prev,
      [studentName]: order,
    }));
  };

  const handleUpdateOrder = (newOrder) => {
    setCoachingOrder(newOrder);
    // 순서 변경 후 정렬이 활성화되어 있으면 자동으로 재정렬
    if (!sortByOrder) {
      setSortByOrder(true);
    }
  };

  // 조별로 그룹핑
  const groups = useMemo(() => {
    const groupMap = {};
    students.forEach((student) => {
      const group = student['조 편성'] || '미분류';
      if (!groupMap[group]) {
        groupMap[group] = [];
      }
      groupMap[group].push(student);
    });
    return groupMap;
  }, [students]);

  const groupNames = useMemo(() => {
    return ['전체', ...Object.keys(groups).sort()];
  }, [groups]);

  // 필터링된 학생 목록
  const filteredStudents = useMemo(() => {
    let result = [];
    if (selectedGroup === '전체') {
      result = students;
    } else {
      result = groups[selectedGroup] || [];
    }

    // 코칭 순서로 정렬
    if (sortByOrder) {
      result = [...result].sort((a, b) => {
        const orderA = coachingOrder[a['성함']] || 9999;
        const orderB = coachingOrder[b['성함']] || 9999;
        return orderA - orderB;
      });
    }

    return result;
  }, [selectedGroup, students, groups, sortByOrder, coachingOrder]);

  const currentStudent = selectedStudentIndex !== null ? filteredStudents[selectedStudentIndex] : null;
  const currentStudentMemos = currentStudent ? (memos[currentStudent['성함']] || []) : [];
  const currentStudentCoaching = currentStudent ? (coachingStatus[currentStudent['성함']] || { round1: false, round2: false, round3: false }) : { round1: false, round2: false, round3: false };
  const currentStudentAnnotations = currentStudent ? (annotations[currentStudent['성함']] || {}) : {};
  const currentStudentOrder = currentStudent ? (coachingOrder[currentStudent['성함']] || '') : '';

  return (
    <div className="app">
      <div className="app-header">
        <h1>학습자 대시보드</h1>
        <button onClick={() => setShowUpload(true)} className="reset-button">
          {students.length > 0 ? '새 파일 업로드' : '파일 업로드'}
        </button>
      </div>
      <div className="group-tabs">
        {groupNames.map((group) => (
          <button
            key={group}
            className={`group-tab ${selectedGroup === group ? 'active' : ''}`}
            onClick={() => {
              setSelectedGroup(group);
              setSelectedStudentIndex(null);
            }}
          >
            {group}
            {group !== '전체' && groups[group] && (
              <span className="count">({groups[group].length})</span>
            )}
          </button>
        ))}
      </div>
      <div className="app-content">
        <StudentList
          students={filteredStudents}
          selectedStudentIndex={selectedStudentIndex}
          onSelectStudent={setSelectedStudentIndex}
          coachingStatus={coachingStatus}
          coachingOrder={coachingOrder}
          sortByOrder={sortByOrder}
          onToggleSortByOrder={() => setSortByOrder(!sortByOrder)}
          onUpdateOrder={handleUpdateOrder}
        />
        <StudentDetail
          student={currentStudent}
          memos={currentStudentMemos}
          onAddMemo={handleAddMemo}
          onDeleteMemo={handleDeleteMemo}
          onEditMemo={handleEditMemo}
          coachingStatus={currentStudentCoaching}
          onToggleCoaching={handleToggleCoaching}
          annotations={currentStudentAnnotations}
          onUpdateAnnotations={handleUpdateAnnotations}
          coachingOrder={currentStudentOrder}
          onSetCoachingOrder={handleSetCoachingOrder}
        />
      </div>

      {showUpload && (
        <FileUpload onDataLoad={handleDataLoad} onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
}

export default App;

