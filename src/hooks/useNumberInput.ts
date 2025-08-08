import { useState, useCallback } from 'react';

export const useNumberInput = (initialValue: string = '') => {
  const [displayValue, setDisplayValue] = useState(initialValue);

  // 数値のみを抽出して数値に変換
  const getNumericValue = useCallback((value: string): number => {
    const numericString = value.replace(/[^\d]/g, '');
    return numericString ? parseInt(numericString, 10) : 0;
  }, []);

  // 数値にカンマを追加して表示用の文字列に変換
  const formatWithCommas = useCallback((value: number): string => {
    return value.toLocaleString('ja-JP');
  }, []);

  // 入力値の変更を処理
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 空文字列の場合はそのまま設定
    if (inputValue === '') {
      setDisplayValue('');
      return;
    }

    // 数値のみを抽出
    const numericValue = getNumericValue(inputValue);
    
    // カンマ付きで表示
    const formattedValue = formatWithCommas(numericValue);
    setDisplayValue(formattedValue);
  }, [getNumericValue, formatWithCommas]);

  // 数値を取得（カンマなし）
  const getValue = useCallback((): number => {
    return getNumericValue(displayValue);
  }, [displayValue, getNumericValue]);

  // 表示値を設定
  const setValue = useCallback((value: number) => {
    setDisplayValue(formatWithCommas(value));
  }, [formatWithCommas]);

  return {
    displayValue,
    handleChange,
    getValue,
    setValue,
  };
}; 