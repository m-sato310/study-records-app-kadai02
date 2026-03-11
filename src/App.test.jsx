const mockSelect = jest.fn();
const mockInsertSelect = jest.fn();

// ✅ supabaseClient.js をテスト用のダミーに差し替える
jest.mock('./supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => mockSelect(),
      insert: () => ({
        select: () => mockInsertSelect(),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  },
}));

import userEvent from '@testing-library/user-event';
import App from './App';
import { render, screen, waitFor } from '@testing-library/react';

describe('App コンポーネント', () => {
  beforeEach(() => {
    mockSelect.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  test('「学習記録一覧」というタイトルが表示される', async () => {
    render(<App />);

    // useEffect の非同期処理（データ取得→State更新）が完了するまで待つ
    await waitFor(() => {
      expect(screen.getByText('学習記録一覧')).toBeInTheDocument();
    });
  });

  test('フォームに入力して登録ボタンを押すと記録が追加される', async () => {
    const user = userEvent.setup();

    mockInsertSelect.mockResolvedValue({
      data: [{ id: 99, title: 'React', time: 3 }],
      error: null,
    });

    render(<App />);

    const contentInput = screen.getByLabelText('学習内容');
    const hourInput = screen.getByLabelText('学習時間');
    await user.type(contentInput, 'React');
    await user.clear(hourInput);
    await user.type(hourInput, '3');

    const button = screen.getByRole('button', { name: '登録' });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName === 'LI' && element.textContent.replace(/\s+/g, '').includes('React：3時間');
      })).toBeInTheDocument();
    });
  });

  test('削除ボタンを押すと学習記録が削除される', async () => {
    const user = userEvent.setup();

    mockSelect.mockResolvedValue({
      data: [{ id: 99, title: 'React', time: 3 }],
      error: null,
    });

    render(<App />);

    const deleteButton = await screen.findByRole('button', { name: '削除' });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText((content, element) => {
        return element.tagName === 'LI' && element.textContent.replace(/\s+/g, '').includes('React：3時間');
      })).not.toBeInTheDocument();
    });
  });

  test('入力されていない項目があるとエラーメッセージが表示される', async () => {
    const user = userEvent.setup();

    render(<App />);

    // 初期状態：エラーメッセージが表示されている
    expect(
      screen.getByText('入力されていない項目があります')
    ).toBeInTheDocument();

    // 両方入力する
    const contentInput = screen.getByLabelText('学習内容');
    const hourInput = screen.getByLabelText('学習時間');
    await user.type(contentInput, 'React');
    await user.clear(hourInput);
    await user.type(hourInput, '3');

    // 入力後：エラーメッセージが消える
    expect(
      screen.queryByText('入力されていない項目があります')
    ).not.toBeInTheDocument();
  });

});
