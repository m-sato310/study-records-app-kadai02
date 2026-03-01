import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [studyContent, setStudyContent] = useState('');
  const [studyHour, setStudyHour] = useState(0);
  const [studyRecords, setStudyRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const changeStudyContent = (e) => {
    setStudyContent(e.target.value);
  };

  const changeStudyHour = (e) => {
    setStudyHour(Number(e.target.value));
  };

  const addStudyRecord = async () => {
    if (!studyContent.trim() || !studyHour) {
      alert('学習内容と学習時間を入力してください');
      return;
    }
    const { data, error } = await supabase
      .from('study-records')
      .insert([{ title: studyContent, time: studyHour }])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    const newRecords = [...studyRecords, ...data];
    setStudyRecords(newRecords);
    setStudyContent('');
    setStudyHour(0);
  };

  const deleteStudyRecord = async (id) => {
    const { error } = await supabase
      .from('study-records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      return;
    }

    const newRecords = studyRecords.filter((record) => record.id !== id);
    setStudyRecords(newRecords);
  };

  useEffect(() => {
    const fetchStudyRecords = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('study-records')
        .select('*');

      if (error) {
        console.error(error);
        return;
      }

      setStudyRecords(data);
      setIsLoading(false);
    };
    fetchStudyRecords();
  }, []);

  const totalStudyHours = studyRecords.reduce((totalValue, record) => {
    return totalValue + Number(record.time);
  }, 0);

  return (
    <>
      <div>
        <h1>学習記録一覧</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {studyRecords.map((record) => (
              <li key={record.id}>
                {record.title}：{record.time}時間
                <button onClick={() => deleteStudyRecord(record.id)}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div>
          <label htmlFor="study-content">学習内容</label>
          <input
            type="text"
            id="study-content"
            value={studyContent}
            onChange={changeStudyContent}
          />
        </div>
        <div>
          <label htmlFor="study-hours">学習時間</label>
          <input
            type="number"
            id="study-hours"
            value={studyHour}
            onChange={changeStudyHour}
          />
          <span>時間</span>
        </div>
        <span>入力されている学習内容:{studyContent}</span>
        <br />
        <span>入力されている学習時間:{studyHour}時間</span>
        <br />
        <button onClick={addStudyRecord}>登録</button>
        <br />
        {(!studyContent || !studyHour) && (
          <span style={{ color: 'red' }}>入力されていない項目があります</span>
        )}
        <br />
        <span>合計時間: {totalStudyHours}/ 1000(h)</span>
      </div>
    </>
  );
}

export default App;
